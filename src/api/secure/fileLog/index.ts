import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { BizFileOperateLogVO, FileLogQuery } from './types';

/**
 * 分页查询文件操作日志
 */
export function listFileLogs(query: FileLogQuery): AxiosPromise<BizFileOperateLogVO[]> {
  return request({
    url: '/secure/fileLog/list',
    method: 'get',
    params: query
  });
}
