import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { BizFileShareVO } from './types';

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
