import { ex } from "./utiles";

// import { QueryResult, dataobjType, dataobjMap } from "./database/database";
enum Code{
  // -- 기본.
  success = 0,
  __init = 1,
  unknown_error,
  exception,
  invalid_progress,
  critical_error,
  // -- db 에러 100 ~ 199
  db_blackout = 100,
  db_query_err,
  // -- 논리 에러 200 ~ 299
  duplication_id = 200,
  invalid_id,
  not_found,
  fail,
  already_send,
  wrong_request,
  partial_fail_or_all_fail,
  // -- http 서버 에러 300 ~ 399
  empty_files,
}
type Codemap = string;
function Codemap( code:Code ):Codemap
{
  switch ( code )
  {
    // -- 기본.
    default:return('error-code-'+code);
    case Code.success:return( 'success' );
    case Code.__init:return( 'dev-error' );
    case Code.unknown_error:return( 'unknown-error' );
    case Code.exception:return( 'query-exception' );
    case Code.invalid_progress:return( 'invalid-progress' );
    case Code.critical_error:return( 'critical-error' );
    // -- db 에러.
    case Code.db_blackout:return( 'db-blackout' );
    case Code.db_query_err:return( 'db-query-err' );
    // -- 논리 에러.
    case Code.duplication_id:return( 'duplication-id' );
    case Code.invalid_id:return( 'invalid-id' );
    case Code.not_found:return( 'not-found' );
    case Code.fail:return( 'fail' );
    case Code.already_send:return( 'already-send' );
    case Code.wrong_request:return( 'wrong-request' );
    case Code.partial_fail_or_all_fail:return( 'partial-fail-or-all-fail' );
    // -- http 서버 에러.
    case Code.empty_files:return( 'empty-files' );
  }
}
enum dataobjType{
  unknown = -1,
  client = 0,
  text,
  memo,
  file,
}
function dataobjMap( code:dataobjType ):string
{
  switch ( code )
  {
    default:
    case dataobjType.unknown:return( 'unknown' );

    case dataobjType.client:return( 'client' );
    case dataobjType.text:return( 'text' );
    case dataobjType.memo:return( 'memo' );
    case dataobjType.file:return( 'file' );
  }
}
abstract class QueryResult{
  code:Code = Code.__init;
  msg:Codemap = Codemap(Code.__init);
  constructor( code?:Code )
  {
    if ( code == undefined ) return;
    this.code = code;
    this.msg = Codemap(code);
  }
}



//........................................................................
//........................................................................
//........................................................................
//........................................................................





class ReqResult extends QueryResult{}
// --[ data-uploads ]
class DataInfo{
  data_id:number = 0;
  data_type:dataobjType = dataobjType.unknown;
  file_name:string = "";
  file_size:number = 0;
  constructor( field?:DataInfo )
  {
    if ( !field ) return;
    this.data_id = field.data_id;
    this.data_type = field.data_type;
    this.file_name = field.file_name;
    this.file_size = field.file_size;
  }
}
class JsonDataUploads extends ReqResult{
  share_id_1:number = 0;
  share_id_2:number = 0;
  data_info_list:DataInfo[] = [];
  constructor( code?:Code, field?:{ share_id_1:number, share_id_2:number, data_info_list:DataInfo[] } ){
    super(code);
    if (ex(
      code == Code.success,
      field != undefined,
    )) return;
    this.share_id_1 = field?.share_id_1!;
    this.share_id_2 = field?.share_id_2!;
    this.data_info_list = field?.data_info_list!;
  }
}
class JsonGetDataInfo extends ReqResult{
  data_info_list:DataInfo[] = [];
  constructor( code?:Code, data_info_list?:DataInfo[] )
  {
    super(code);
    if ( data_info_list == undefined || code != Code.success ) return;
    this.data_info_list = data_info_list;
  }
}
class JsonGetBroadcastID extends ReqResult{
  broadcast_id_1:number = 0;
  broadcast_id_2:number = 0;
  constructor( code?:Code, broad_id?:{id_1:number, id_2:number} )
  {
    super(code);
    if ( broad_id == undefined || code != Code.success ) return;
    this.broadcast_id_1 = broad_id.id_1;
    this.broadcast_id_2 = broad_id.id_2;
  }
}


export{
  Code,
  DataInfo,
  dataobjType,
  dataobjMap,
  JsonDataUploads,
  JsonGetDataInfo,
  JsonGetBroadcastID,
}