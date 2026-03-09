import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { BizFileShareVO, ShareExtractVO } from './types';

/**
 * 校验并提取分享信息（免登录）
 * @param shareLink 短链接
 * @param extractCode 提取码（需要时必填）
 */
export function extractShare(shareLink: string, extractCode?: string): AxiosPromise<ShareExtractVO> {
  const params: Record<string, string> = { shareLink };
  if (extractCode) {
    params.extractCode = extractCode;
  }
  return request({
    url: '/secure/share/extract',
    method: 'post',
    params,
    headers: { isToken: false }
  });
}

/**
 * 创建分享
 * @param fileId 被分享的文件ID
 * @param expireDays 有效天数，null 表示永久，7 表示7天，1 表示1天
 * @param needCode 是否需要提取码
 */
export function createShare(
  fileId: number,
  expireDays: number | null,
  needCode: boolean
): AxiosPromise<BizFileShareVO> {
  const params: Record<string, any> = { fileId, needCode };
  if (expireDays != null) {
    params.expireDays = expireDays;
  }
  return request({
    url: '/secure/share/create',
    method: 'post',
    params
  });
}
