
export enum LinkType {
  OUTSOURCED = 'Terceirizado',
  CIVIL_SERVANT = 'Servidor Público',
  INTERN = 'Estagiário',
  TEMPORARY = 'Temporário',
  COMMISSIONED = 'Cargo Comissionado'
}

export enum CardStatus {
  ACTIVE = 'Ativo',
  INACTIVE = 'Inativo',
  BLOCKED = 'Bloqueado',
  LOST = 'Perdido'
}

export enum CardIssue {
  FIRST = '1ª Via',
  SECOND = '2ª Via',
  THIRD = '3ª Via'
}

export interface UserAttachment {
  name: string;
  type: string;
  data: string; // Base64 string for simplicity in JSON exports
  size: number;
}

export interface AccessUser {
  id: string;
  citSmartNr: string;
  fullName: string;
  linkType: LinkType;
  cpf: string;
  phone: string;
  department: string;
  secretary: string;
  accessCardNumber: string;
  cardIssue: CardIssue;
  status: CardStatus;
  attachment?: UserAttachment;
  updatedAt: string;
}

export type UserFormData = Omit<AccessUser, 'id' | 'updatedAt'>;
