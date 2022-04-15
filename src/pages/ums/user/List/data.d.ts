

type UserStatus = {
  validity?: 'valid' | 'invalid'
}

type User = {
  uid?: number;
  nick?: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  insertTime?: Date;
  status?: UserStatus;
};

type UserListItem = {
  uid?: number;
  nick?: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  insertTime?: Date;
  validity?: 'valid'|'invalid';
}



