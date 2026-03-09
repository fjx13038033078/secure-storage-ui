export interface BizFileOperateLogVO {
  logId: number;
  userId?: number;
  userName?: string;
  fileId?: number;
  operateType: string;
  ipaddr?: string;
  createTime?: string;
}

export interface FileLogQuery extends PageQuery {
  pageNum: number;
  pageSize: number;
  operateType?: string;
  userName?: string;
}
