import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface UserProfileProps {
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    photo_url: string;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <img src={user.photo_url} alt={user.username} className="rounded-full" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="font-normal">
          {user.first_name} {user.last_name}
        </DropdownMenuItem>
        <DropdownMenuItem className="font-normal">
          @{user.username}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}