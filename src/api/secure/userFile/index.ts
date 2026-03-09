import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { BizUserFileVO, UserFileQuery } from './types';

/**
 * 查询当前用户的文件列表
 */
export function listUserFiles(query: UserFileQuery): AxiosPromise<BizUserFileVO[]> {
  return request({
    url: '/secure/file/list',
    method: 'get',
    params: query
  });
}

/**
 * 删除文件
 */
export function delUserFile(fileIds: number | number[]) {
  const ids = Array.isArray(fileIds) ? fileIds.join(',') : fileIds;
  return request({
    url: '/secure/file/' + ids,
    method: 'delete'
  });
}
