/**
 * Account Data Transfer Object
 * Used for transferring account data between layers
 */
export interface AccountDto {
  id: string;
  name: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}