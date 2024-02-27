class AdminUserDTO {
  id?: number;
  login!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  phoneNumber!: string;
  imageUrl?: string;
}

export { AdminUserDTO };
