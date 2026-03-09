export interface BizUserFileVO {
  fileId: number;
  userId?: number;
  ossId?: number;
  fileName: string;
  fileSuffix?: string;
  fileSize?: number;
  isEncrypted?: string;
  createTime?: string;
}

export interface UserFileQuery extends PageQuery {
  pageNum: number;
  pageSize: number;
}
