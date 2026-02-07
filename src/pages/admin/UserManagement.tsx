import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Shield, 
  User as UserIcon, 
  Crown,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAllUsersWithRoles, useAssignRole, useRemoveRole, AppRole } from '@/hooks/useAdmin';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const roleColors: Record<AppRole, string> = {
  admin: 'bg-destructive text-destructive-foreground',
  moderator: 'bg-warning text-warning-foreground',
  user: 'bg-muted text-muted-foreground',
};

const roleIcons: Record<AppRole, React.ElementType> = {
  admin: Shield,
  moderator: Crown,
  user: UserIcon,
};

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<AppRole | 'all'>('all');
  
  const { data: users, isLoading } = useAllUsersWithRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter(user => {
      const matchesSearch = 
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleRoleChange = (userId: string, currentRole: AppRole, newRole: AppRole) => {
    if (currentRole !== 'user') {
      removeRole.mutate({ userId, role: currentRole });
    }
    if (newRole !== 'user') {
      assignRole.mutate({ userId, role: newRole });
    }
  };

  return (
    <AdminLayout 
      title="User Management" 
      description="Kelola pengguna dan hak akses"
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as AppRole | 'all')}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border rounded-lg overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Level</TableHead>
                <TableHead className="hidden md:table-cell">XP</TableHead>
                <TableHead className="hidden lg:table-cell">Terakhir Aktif</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Tidak ada pengguna ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const RoleIcon = roleIcons[user.role];
                  return (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>
                              {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.full_name || 'Unnamed User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">Lv. {user.current_level}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.total_xp?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {user.last_active_at 
                          ? formatDistanceToNow(new Date(user.last_active_at), { 
                              addSuffix: true,
                              locale: idLocale 
                            })
                          : 'Belum pernah'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role]}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user.user_id, user.role, 'admin')}
                              disabled={user.role === 'admin'}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Set as Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user.user_id, user.role, 'moderator')}
                              disabled={user.role === 'moderator'}
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              Set as Moderator
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user.user_id, user.role, 'user')}
                              disabled={user.role === 'user'}
                              className="text-destructive"
                            >
                              <UserIcon className="h-4 w-4 mr-2" />
                              Remove Role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </motion.div>

        {/* Stats */}
        {users && (
          <div className="text-sm text-muted-foreground">
            Menampilkan {filteredUsers.length} dari {users.length} pengguna
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
