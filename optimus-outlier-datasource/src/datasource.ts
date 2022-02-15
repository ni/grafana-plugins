import defaults from 'lodash/defaults';
import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';
import { FilterWafersQuery, OutlierDetectionServerOptions, defaultQuery, Wafer, Die, RequestType } from './types';
import { doMockRequest } from 'mockData';

export class DataSource extends DataSourceApi<FilterWafersQuery, OutlierDetectionServerOptions> {

  constructor(instanceSettings: DataSourceInstanceSettings<OutlierDetectionServerOptions>) {
    super(instanceSettings);
  }

  async query(options: DataQueryRequest<FilterWafersQuery>): Promise<DataQueryResponse> { 
    const promises = options.targets.map(target => {
      const query = defaults(target, defaultQuery);
      switch(query.requestType) {
        case RequestType.GetWafersList: return this.getWaferList(options, query);
        case RequestType.GetWafer: return this.getWafer(options, query)
        case RequestType.GetDice: return this.getWaferDice(options, query);
        default: return undefined;
      }
    });
    return Promise.all(promises).then((data) => ({ data }));
  }

  async getWaferList(options: DataQueryRequest<FilterWafersQuery>, query: FilterWafersQuery): Promise<MutableDataFrame<Wafer>> {      
     return doMockRequest(options, query).then((response) => {
        const frame = new MutableDataFrame<Wafer>({
          refId: query.refId,
          fields: [
            { name: 'id', type: FieldType.string },
            { name: 'name', type: FieldType.string },
            { name: 'source', type: FieldType.string },
            { name: 'yieldBefore', type: FieldType.string },
            { name: 'totalGoodUnits', type: FieldType.string },
            { name: 'yieldAfterGDBN', type: FieldType.string },
            { name: 'yieldLoss', type: FieldType.string },
            { name: 'totalOutliers', type: FieldType.string },
          ],
        });
        
        for (let wafer of response) {
          frame.add(wafer);
        }
        
        return frame;
      });
  }

  async getWafer(options: DataQueryRequest<FilterWafersQuery>, query: FilterWafersQuery): Promise<MutableDataFrame<Wafer>> {      
    return doMockRequest(options, query).then((response) => {
       const wafer = response[0];
       const frame = new MutableDataFrame<Wafer>({
         refId: query.refId,
         fields: [
           { name: 'id', type: FieldType.string },
           { name: 'name', type: FieldType.string },
           { name: 'source', type: FieldType.string },
           { name: 'yieldBefore', type: FieldType.string },
           { name: 'totalGoodUnits', type: FieldType.string },
           { name: 'yieldAfterGDBN', type: FieldType.string },
           { name: 'yieldLoss', type: FieldType.string },
           { name: 'totalOutliers', type: FieldType.string },
         ],
       });

       if(wafer) {
        frame.add(wafer);
       }
       return frame;
     });
 }

  async getWaferDice(options: DataQueryRequest<FilterWafersQuery>, query: FilterWafersQuery): Promise<MutableDataFrame> {      
    return doMockRequest(options, query).then((response) => {
      const wafer = response[0];
      const frame = new MutableDataFrame<Die>({
        refId: query.refId,
        fields: [
          { name: 'x', type: FieldType.number },
          { name: 'y', type: FieldType.number },
          { name: 'type', type: FieldType.string },
        ],
      });

      if(wafer) {
        let dice = wafer.dice;
        for (let die of dice) {
          frame.add(die);
        }
      }
      return frame;
     });
  }

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
