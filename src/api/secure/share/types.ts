export interface BizFileShareVO {
  shareId?: number;
  fileId?: number;
  shareLink: string;
  extractCode?: string;
  expireTime?: string;
  status?: string;
  createTime?: string;
}

/** 分享提取结果 */
export interface ShareExtractVO {
  fileName: string;
  fileSize?: number;
  downloadToken: string;
}
