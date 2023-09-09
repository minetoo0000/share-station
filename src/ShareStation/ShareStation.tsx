// --[[ import ]]
import { useCallback, useEffect, useMemo, useState, useRef, WheelEvent, ChangeEvent, KeyboardEvent } from "react";
import { useMediaQuery } from "react-responsive";
import style from "./ShareStation.module.scss";
import { and, calcTime, ClearScroll, DB, ex } from "../utiles";
import LOGO from "./../media/logo-share_station.svg";
import { Code, DataInfo, JsonDataUploads, JsonGetBroadcastID, JsonGetDataInfo, JsonGetTextData, dataobjType } from "./../classRequest";
// --[ Station ]
import TextStation from "./Text/Text";
import FileStation from "./File/File";
import { CenterMode, ShareCenter } from "./ShareCenter/ShareCenter";
import BroadcastStation from "./Broadcast/Broadcast";


// --[[ init ]]
DB.init();
// const base_url = "http://192.168.1.12:2520";
// const base_url = "http://10.246.98.194:2520";
// const base_url = "http://10.246.97.96:2520";
const base_url = "http://localhost:2520";


// --[[ class ]]
class ReqResult{
  success:boolean = false;
  constructor( success?:boolean )
  {
    if ( success != undefined ) this.success = success;
  }
}
enum StateShareID { dim, upload_wait, upload_success, upload_fail }
interface ShareID{ state:StateShareID, share_id_1:number, share_id_2:number, data_info_list:DataInfo[] }
enum feedback{ yet, wait, fail, success }
class BroadcastState{
  state:feedback = feedback.yet;
  id_1:number = 0;
  id_2:number = 0;
  constructor( state:feedback, id_1?:number, id_2?:number )
  {
    this.state = state;
    if ( state != feedback.success ) return;
    this.id_1 = id_1!;
    this.id_2 = id_2!;
  }
}
class StateGet{
  state:feedback = feedback.yet;
  data_info_list:DataInfo[] = [];
  constructor( state?:feedback, data_info_list?:DataInfo[] )
  {
    if ( state == undefined ) return;
    this.state = state;
    if ( data_info_list == undefined ) return;
    this.data_info_list = data_info_list;
  }
}
class StateBroadcast{
  state:feedback = feedback.yet;
  client_id_1:number = 0;
  client_id_2:number = 0;
  constructor( state?:feedback, field?:{client_id_1:number, client_id_2:number} )
  {
    if ( state == undefined ) return;
    this.state = state;
    if ( field == undefined ) return;
    this.client_id_1 = field.client_id_1;
    this.client_id_2 = field.client_id_2;
  }
}
class PickupInfo{
  constructor(
    // public type:CenterMode = CenterMode.text,
    public type:dataobjType = dataobjType.unknown,
    public id_1:number = 0,
    public id_2:number = 0,
  ){}
}


// --[[ function ]]
function headerSetDataType( header:Headers, type:dataobjType ):Headers
{
  header.set("x-sharestation-data-type", type.toString());
  return( header );
}
function postmethod( body?:BodyInit, headers?:HeadersInit ):RequestInit
{
  const post:RequestInit = {
    method:"post",
    mode:"cors",
    credentials:"include",
    headers,
    body,
  };
  return( post );
}
function getmethod( body?:BodyInit, headers?:HeadersInit ):RequestInit
{
  const get:RequestInit = {
    method:"get",
    mode:"cors",
    credentials:"include",
    headers,
    body,
  };
  return( get );
}
function reqError( err:any ):-1
{
  console.error(`요청 에러:`, err);
  return( -1 );
}
function CenterModeMap( mode:CenterMode ):string
{
  switch ( mode )
  {
    default:
    case CenterMode.text:return( 'text' );
    case CenterMode.memo:return( 'memo' );
    case CenterMode.file:return( 'file' );
    case CenterMode.broadcast:return( 'broadcast' );
    case CenterMode.storage:return( 'storage' );
  }
}


// --[[ query ]]
class DataUpload extends ReqResult{
  share_id_1?:number = 0;
  share_id_2?:number = 0;
  data_info_list?:DataInfo[] = [];
  constructor( field?:DataUpload )
  {
    super(field?.success);
    if ( field?.success != true ) return;
    this.share_id_1 = field.share_id_1;
    this.share_id_2 = field.share_id_2;
    this.data_info_list = field.data_info_list;
  }
}
class SendData{
  broadcast_id_1:number = 0;
  broadcast_id_2:number = 0;
  share_id_1:number = 0;
  share_id_2:number = 0;
  constructor( field:SendData )
  {
    this.broadcast_id_1 = field.broadcast_id_1;
    this.broadcast_id_2 = field.broadcast_id_2;
    this.share_id_1 = field.share_id_1;
    this.share_id_2 = field.share_id_2;
  }
  // constructor(
  //   field?:{
  //     broadcast_id_1:number,
  //     broadcast_id_2:number,
  //     share_id_1:number,
  //     share_id_2:number,
  //   }
  // )
  // {
  //   if (ex(
  //     success == true,
  //     field != undefined
  //   )) return;
  //   this.broadcast_id_1 = field!.broadcast_id_1;
  //   this.broadcast_id_2 = field!.broadcast_id_2;
  //   this.share_id_1 = field!.share_id_1;
  //   this.share_id_2 = field!.share_id_2;
  // }
}
class PickupList extends ReqResult{
  share_id_list:PickupInfo[] = [];
  constructor( success?:boolean, share_id_list?:PickupInfo[] )
  {
    super(success);
    if ( success != true || share_id_list == undefined ) return;
    this.share_id_list = share_id_list;
  }
}
class GetDataInfo extends ReqResult{
  data_info_list:DataInfo[] = [];
  constructor( success?:boolean, data_info_list?:DataInfo[] )
  {
    super(success);
    if ( data_info_list == undefined || success == false ) return;
    this.data_info_list = [...data_info_list];
  }
}
class GetText extends ReqResult{
  text:string = "";
  constructor( success?:boolean, text?:string )
  {
    super(success);
    if ( text == undefined || success == false ) return;
    this.text = text;
  }
}
async function urlTextUpload( text:string ):Promise<DataUpload>
{
  // -- init
  let result = new DataUpload();
  let state:0|1|-1 = -1;
  let json:JsonDataUploads = new JsonDataUploads();
  const form = new FormData();
  const row_header = new Headers();
  
  
  // -- function
  async function saveDataInfo( data:Response ):Promise<0|1>
  {
     json = await data.json();
    if ( json.code != 0 )
    {
      return( 0 );
    }
    for ( const data_info of json.data_info_list as DataInfo[] )
    {
      DB.set_data(data_info.data_id, data_info.data_type);
    }
    return( 1 );
  }


  // -- logic
  do{
    row_header.set("x-sharestation-data-type", dataobjType.text.toString());
    form.append("uploads", new File([text], "text", { type:"text/plain" }));

    state = await fetch(base_url+"/data-uploads", {
      method:"post",
      mode:"cors",
      credentials:"include",
      body:form,
      headers:row_header,
    }).then(saveDataInfo).catch(reqError);

    if ( state == 1 )
    {
      result = new DataUpload({
        success:true,
        share_id_1:json.share_id_1,
        share_id_2:json.share_id_2,
        data_info_list:json.data_info_list,
      });
      break;
    }
    else
    {
      result = new DataUpload({success:false});
      break;
    }
  }while(0);
  // -- return
  return( result );
}
async function XXurlDataUpload( memo:string ):Promise<DataUpload>
{
  // -- init
  let result = new DataUpload();
  let state:0|1|-1 = -1;
  let json:JsonDataUploads = new JsonDataUploads();
  const form = new FormData();
  const row_header = new Headers();
  
  
  // -- function
  async function saveDataInfo( data:Response ):Promise<0|1>
  {
     json = await data.json();
    if ( json.code != 0 )
    {
      return( 0 );
    }
    for ( const data_info of json.data_info_list as DataInfo[] )
    {
      DB.set_data(data_info.data_id, data_info.data_type);
    }
    return( 1 );
  }


  // -- logic
  do{
    row_header.set("x-sharestation-data-type", dataobjType.memo.toString());
    form.append("uploads", new File([memo], "memo", { type:"text/plain" }));

    state = await fetch(base_url+"/data-uploads", {
      method:"post",
      mode:"cors",
      credentials:"include",
      body:form,
      headers:row_header,
    }).then(saveDataInfo).catch(reqError);

    if ( state == 1 )
    {
      result = new DataUpload({
        success:true,
        share_id_1:json.share_id_1,
        share_id_2:json.share_id_2,
        data_info_list:json.data_info_list,
      });
      break;
    }
    else
    {
      result = new DataUpload({success:false});
      break;
    }
  }while(0);
  // -- return
  return( result );
}
async function urlFilesUpload( files:File[] ):Promise<DataUpload>
{
  // -- init
  let result = new DataUpload();
  let state:0|1|-1 = -1;
  let json:JsonDataUploads = new JsonDataUploads();
  const form = new FormData();
  const row_header = new Headers();
  
  
  // -- function
  async function saveDataInfo( data:Response ):Promise<0|1>
  {
     json = await data.json();
    if ( json.code != 0 )
    {
      return( 0 );
    }
    for ( const data_info of json.data_info_list as DataInfo[] )
    {
      DB.set_data(data_info.data_id, data_info.data_type);
    }
    return( 1 );
  }


  // -- logic
  do{
    row_header.set("x-sharestation-data-type", dataobjType.file.toString());
    for ( const file of files ) form.append("uploads", file);

    
    state = await fetch(base_url+"/data-uploads", {
      method:"post",
      mode:"cors",
      credentials:"include",
      body:form,
      headers:row_header,
    }).then(saveDataInfo).catch(reqError);

    if ( state == 1 )
    {
      result = new DataUpload({
        success:true,
        share_id_1:json.share_id_1,
        share_id_2:json.share_id_2,
        data_info_list:json.data_info_list,
      });
      break;
    }
    else
    {
      result = new DataUpload({success:false});
      break;
    }
  }while(0);
  // -- return
  return( result );
}
async function urlSendData( field:SendData ):Promise<ReqResult>
{
  // -- init
  let result = new ReqResult();
  let state:0|1|-1 = -1;
  let res:{
    code:number,
    msg:string,
    share_id_1:number,
    share_id_2:number,
  };
  let raw_json:string = JSON.stringify({});
  // -- function
  async function check( data:Response ):Promise<0|1>
  {
    res = await data.json();
    if ( res.code == 0 )
    {
      return( 1 );
    }
    else return( 0 );
  }
  // -- system
  do{
    raw_json = JSON.stringify(new SendData({
      broadcast_id_1:field.broadcast_id_1,
      broadcast_id_2:field.broadcast_id_2,
      share_id_1:field.share_id_1,
      share_id_2:field.share_id_2,
    }));
    /////////////////////////////////////
    console.log(`raw_json:`,raw_json);

    const header = new Headers();
    header.set("content-type", "application/json");
    state = await fetch(base_url+"/send-data", postmethod(raw_json, header)).then(check).catch(reqError);
    result = new ReqResult(state==1);
  }while(0);
  // -- return
  return( result );
}
async function urlGetPickupList():Promise<PickupList>
{
  // -- init
  let result = new PickupList();
  let state:0|1|-1 = -1;
  let res:{
    code:number,
    share_id_list:PickupInfo[],
  } = {
    code:-1,
    share_id_list:[],
  };
  // -- function
  async function check( data:Response ):Promise<0|1>
  {
    res = await data.json();
    //? 실패 시.
    if ( res.code != 0 )
    {
      return( 0 );
    }
    return( 1 );
  }
  // -- system
  do{
    state = await fetch(base_url+"/get-pickup-list", getmethod()).then(check).catch(reqError);
    result = new PickupList(state==1, res.share_id_list);
  }while(0);
  // -- return
  return( result );
}
async function urlGetDataInfo( code_1:number, code_2:number ):Promise<GetDataInfo>
{
  // -- init
  let result = new GetDataInfo();
  let req_result:JsonGetDataInfo;
  let state:0|1|-1 = 0;
  // -- function
  async function checkRes( value:Response ):Promise<0|1>
  {
    req_result = await value.json();
    //? 에러인 경우.
    if ( req_result.code == 0 )
    {
      return( 1 );
    }
    return( 0 );
  }
  // -- system
  do{
    if (ex( code_1>=0, code_2>=0 )) 
    {
      result = new GetDataInfo(false);
      break;
    }

    const raw_json = JSON.stringify({ code_1,code_2 });
    const header = new Headers();
    header.append("content-type","application/json");
    state = await fetch(base_url+"/get-data-info", postmethod(raw_json, header)).then(checkRes).catch(reqError);
    if ( state != 1 )
    {
      result = new GetDataInfo(false);
      break;
    }

    result = new GetDataInfo(true, req_result!.data_info_list);
  }while(0);
  // -- return
  return( result );
}
async function urlGetBroadcastID():Promise<JsonGetBroadcastID>
{
  // -- init
  let result = new JsonGetBroadcastID();
  let state:0|1|-1 = -1;
  // -- function
  async function getID( data:Response ):Promise<0|1>
  {
    const raw_json = await data.json().then().catch();
    if ( typeof(raw_json) != 'object' )
    {
      result = new JsonGetBroadcastID(Code.fail);
      return( 0 );
    }
    result = raw_json as JsonGetBroadcastID;
    return( 1 );
  }
  // -- system
  do{
    state = await fetch(base_url+"/get-broadcast-id", getmethod()).then(getID).catch(reqError);
  }while(0);
  // -- return
  return( result );
}
async function urlGetTextData( data_id:number ):Promise<GetText>
{
  // -- init
  let result = new GetText();
  let res_result = new JsonGetTextData();
  let state:0|1|-1 = -1;
  // -- function
  async function resCheck( data:Response ):Promise<0|1>
  {
    res_result = await data.json();
    if (ex(
      res_result?.code == Code.success,
      typeof res_result?.text == 'string',
    )) return( 0 );
    return( 1 );
  }
  // -- logic
  do{
    state = await fetch(base_url+"/get-data-text/"+String(data_id), getmethod()).then(resCheck).catch(reqError);
    if ( state != 1 )
    {
      result = new GetText(false);
      break;
    }

    result = new GetText(true, res_result.text);
  }while(0);
  // -- return
  return( result );
}


// --[[ 중앙 제어 관제탑 ]]
// --[ 기본 레이아웃 ]
function _MainControlTower()
{
  // --[ init ]
  const is_tilt_row:boolean = useMediaQuery({minWidth:1024, orientation:"landscape"});
  const scroll_id = "station_list";
  const scroll = useRef(new ClearScroll(scroll_id));
  const state_init = useRef<boolean>(false);
  const [ mode, setMode ] = useState<CenterMode>(CenterMode.text);
  const [ text, setText ] = useState<string>("");
  const [ files, setFiles ] = useState<File[]>([]);
  const [ share_id, setShareID ] = useState<ShareID>({
    state:StateShareID.dim,
    share_id_1:0,
    share_id_2:0,
    data_info_list:[],
  });
  const [ state_send, setStateSend ] = useState<BroadcastState>({
    state:feedback.yet,
    id_1:0,
    id_2:0,
  });
  const [ state_get, setStateGet ] = useState<StateGet>(new StateGet());
  const [ state_broadcast, setStateBroadcast ] = useState<StateBroadcast>(new StateBroadcast());
  const [ state_pickup_list, setStatePickupList ] = useState<PickupInfo[]>([]);


  // --[[ function ]]
  function init()
  {
    // -- 한번만 함수가 호출되도록 설정.
    if ( state_init.current ) return;
    state_init.current = true;

    // -- 기본 모드.
    modeText();
    // -- 픽업 리스트 갱신.
    updatePickupList();
    setInterval(updatePickupList, calcTime(0,0,0,2));
    // -- 클라이언트 아이디 갱신.
    updateID();
    setInterval(updateID, calcTime(0,0,10,0));
  }
  useEffect(init, []);
  function modeText() { setMode(CenterMode.text) }
  function modeMemo() { setMode(CenterMode.memo) }
  function modeFile() { setMode(CenterMode.file) }
  function modeBroad() { setMode(CenterMode.broadcast) }
  function modeStorage() { setMode(CenterMode.storage) }
  // --[ 픽업 항목 ]
  //? 텍스트와 파일 모두 본 함수 하나로 처리.
  //? 첫 번째 항목의 타입을 기준으로 타입 구별.
  function handlePickupItemClick( pickup_info:PickupInfo )
  {
    // -- 데이터 가져오기.
    handleClickGet(pickup_info.id_1, pickup_info.id_2);
  }
  // --[ foreground ]
  async function updatePickupList()
  {
    // -- init
    let qr_result;
    // -- function
    // -- logic
    do{
      qr_result = await urlGetPickupList();
      setStatePickupList(qr_result.share_id_list);
    }while(0);
    // -- return
    return( undefined );
  }
  async function updateID()
  {
    // -- init
    let qr_result;
    // -- logic
    do{
      setStateBroadcast(new StateBroadcast(feedback.wait));
      qr_result = await urlGetBroadcastID();
      if ( qr_result.code == Code.success )
      {
        setStateBroadcast(new StateBroadcast(feedback.success, {
          client_id_1:qr_result.broadcast_id_1,
          client_id_2:qr_result.broadcast_id_2,
        }));
        break;
      }
      else
      {
        setStateBroadcast(new StateBroadcast(feedback.fail));
      }
    }while(0);
  }
  // --[ text ]
  function handleChangeText( text:string )
  {
    setText(text);
  }
  //? 데이터 저장 요청.
  async function handleEnterText( text:string )
  {
    setShareID({
      state:StateShareID.upload_wait,
      share_id_1:0,
      share_id_2:0,
      data_info_list:[],
    });
    const result = await urlTextUpload(text);
    console.log(`result:`, result)
    if ( result.success == false )
    {
      console.error(`텍스트 저장 요청 실패`);
      setShareID({
        state:StateShareID.upload_fail,
        share_id_1:0,
        share_id_2:0,
        data_info_list:[],
      });
      return;
    }

    // -- 성공 시.
    setShareID({
      state:StateShareID.upload_success,
      share_id_1:result.share_id_1!,
      share_id_2:result.share_id_2!,
      data_info_list:result.data_info_list!,
    });
  }
  // --[ files ]
  const addFiles = useCallback(
    ( get_files:File[] )=>{
      return( files.concat(get_files) );
    },
    [files]
  );
  function handleAddFiles( files:File[] )
  {
    setFiles(addFiles(files));
  }
  async function handleUploadFiles()
  {
    setShareID({
      state:StateShareID.upload_wait,
      share_id_1:0,
      share_id_2:0,
      data_info_list:[],
    });
    const result = await urlFilesUpload(files);
    if ( result.success == true )
    {
      setShareID({
        state:StateShareID.upload_success,
        share_id_1:result.share_id_1!,
        share_id_2:result.share_id_2!,
        data_info_list:result.data_info_list!,
      });
      return;
    }
    else
    {
      setShareID({
        state:StateShareID.upload_fail,
        share_id_1:0,
        share_id_2:0,
        data_info_list:[],
      });
    }
  }
  // --[ send ]
  async function handleSend( broadcast_id_1:number, broadcast_id_2:number, share_id_1:number, share_id_2:number )
  {
    setStateSend(new BroadcastState(feedback.wait));
    const result = await urlSendData({
      broadcast_id_1,
      broadcast_id_2,
      share_id_1,
      share_id_2,
    });
    if ( result.success == true )
    {
      setStateSend(new BroadcastState(feedback.success, broadcast_id_1, broadcast_id_2));
    }
    else
    {
      setStateSend(new BroadcastState(feedback.fail));
    }
  }
  // --[ get data ]
  async function handleClickGet( code_1:number, code_2:number )
  {
    setStateGet(new StateGet(feedback.wait));
    const req_result = await urlGetDataInfo(code_1, code_2);
    if ( req_result.success != true )
    {
      setStateGet(new StateGet(feedback.fail));
    }
    else{
      console.log(`success:`,req_result);
      setStateGet(new StateGet(feedback.success, req_result.data_info_list));
    }
  }
  // --[ get 데이터 가져오기 ]
  function settingStateGet()
  {
    // -- init
    let type:dataobjType = dataobjType.unknown;
    // -- function
    function callbackurl( qr_result:GetText )
    {
      if ( qr_result.success == false ) return;
      setText(qr_result.text);
      modeText();
    }
    // -- logic
    do{
      if ( state_get.state != feedback.success ) return;

      type = state_get.data_info_list[0].data_type;
      if ( type == dataobjType.text )
      {
        urlGetTextData(state_get.data_info_list[0].data_id).then(callbackurl).catch(reqError);
      }
      else if ( type == dataobjType.file )
      {
        ////////////////////// 데이터 정보 리스트 가져온 후 파일 스태이션에 보이기. 항목 클릭 시 다운로드!
        // setFiles();
      }
      else
      {
        //////////////////////////
      }
    }while(0);
    // -- return
  }
  useEffect(settingStateGet, [state_get]);

  // -- display
  return(
    <div className={CenterModeMap(mode)}>
    <div className={and(
      style.Main,
      is_tilt_row?'TILT_ROW':'',
    )}>
      <div className={style._header}>
        <div className={style.header}>
          <div className={style.logo}>Share Station</div>
        </div>
      </div>
      <div className={style._body}>
        <div className={style.body}>
          <div className={style._station_list}>
            <div
              className={style.station_list}
              onWheel={scroll.current.onScroll}
              ref={( dom )=>{
                if ( dom ) scroll.current.init(dom);
              }}
            >

              <TextStation
                handleClick={modeText}

                set_text={text}
                handleEnter={handleEnterText}
                handleChange={handleChangeText}
              />
              <FileStation
                handleClick={modeFile}
                handleAddFiles={handleAddFiles}
              />
              <BroadcastStation
                handleClick={modeBroad} 

                set_new={true}
                set_get_state={state_get.state}
                set_state_broadcast={state_broadcast}

                handleClickGet={handleClickGet}
              />
              
            </div>
          </div>
          <div className={style._share_center}>
            <ShareCenter
              //! 더이상 사용되지 않음.
              mode={mode}
              handlePickupItemClick={handlePickupItemClick}

              set_send_state={state_send}
              handleSend={handleSend}
              
              set_text={text}
              set_share_id={share_id}
              handleChangeText={handleChangeText}
              handleEnterText={handleEnterText}

              set_files={files}
              handleAddFiles={handleAddFiles}
              handleUploadBtn={handleUploadFiles}

              set_pickup_list={state_pickup_list}
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
function MainControlTower()
{
  return(
    <_MainControlTower/>
  );
}

export{
  MainControlTower,
  feedback,
  StateShareID,
  StateBroadcast,
  BroadcastState,
  PickupInfo,
};
export type {
  ShareID,
};
