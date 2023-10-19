import axios, { AxiosResponse } from 'axios';
import { DEFAULT_GET_BATCH_SIZE, SERVER_URL } from './constants';

export function create2DArray(arr: any[], elementsPerSubarray: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += elementsPerSubarray) {
    result.push(arr.slice(i, i + elementsPerSubarray));
  }
  return result;
}

interface IPaginateApiArgs {
  method: 'GET' | 'POST' | 'PATCH'; // Add more methods if needed
  endpoint: string;
  queryParams?: Record<string, any>;
  body?: Record<string, any>;
  limit?: number;
}

export async function paginateApiOnLastKey({ method, endpoint, queryParams = {}, body = {}, limit = DEFAULT_GET_BATCH_SIZE }: IPaginateApiArgs) {
  const results = [];
  let nextPage = `${SERVER_URL}${endpoint}?limit=${limit}`;

  while (nextPage) {
    try {
      const startTime = performance.now();

      const response = await axios({
        method,
        url: nextPage,
        params: queryParams,
        data: body,
      });

      const { data } = response;

      if (data.data) {
        results.push(...data.data);
      }

      // If the data has a length property > 0 or not null, it means there are more results
      if (data.data?.length) {
        nextPage = `${SERVER_URL}${endpoint}?lastKey=${results[results.length - 1]._id}&limit=${limit}`;
      } else {
        nextPage = '';
      }
      const endTime = performance.now();
      const elapsedTime = endTime - startTime;
      console.log(`time elapsed: ${elapsedTime} milliseconds for - ${nextPage}`);
    } catch (error) {
      console.error('Error fetching data:', error);
      break;
    }
  }
  return results;
}