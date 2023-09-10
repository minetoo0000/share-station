import { ChangeEvent, TouchEvent, KeyboardEvent, MouseEvent, useEffect, useState, useRef, FormEvent, memo } from "react";
import { dataobjMap, dataobjType } from "../../classRequest";
import { DB, ID, and, bytesToSize, ex, isNAN } from "../../utiles";
import style from "./ShareCenter.module.scss";
import { BroadcastState, FileInfo, PickupInfo, ShareID, StateShareID, base_url, feedback, getmethod, reqError } from "../ShareStation";

// --[ init ]
function feedShareID( share_id:ShareID ):string
{
  if ( share_id.state == StateShareID.dim )
  {
    return( "need upload..." );
  }
  else if ( share_id.state == StateShareID.upload_wait )
  {
    return( "uploading..." );
  }
  else if ( share_id.state == StateShareID.upload_success )
  {
    const id_text = `${share_id.share_id_1.toString().padStart(2, '0')} ${share_id.share_id_2.toString().padStart(2, '0')}`;
    return( id_text );
  }
  else
  {
    return( "upload fail" );
  }
}
function broadcastIDParser( id:string ):{success:boolean,id_1:number,id_2:number}
{
  if (ex(
    id.length == 4,
    isNAN(Number(id)) == false,
  ))
  {
    return({
      success:false,
      id_1:0,
      id_2:0,
    });
  }

  return({
    success:true,
    id_1:Number(id.substring(0,2)),
    id_2:Number(id.substring(2,4)),
  });
}
function feedBroadcast( state:BroadcastState ):string
{
  if ( state.state == feedback.yet )
    return( "send" );
  else if ( state.state == feedback.wait )
    return( "wait..." );
  else if ( state.state == feedback.success )
    return( "send success" );
  else
    return( "send fail" );
}


// --[[ Text Center ]]
interface TextShareCenterProps{
  set_share_id:ShareID;

  set_text:string;
  handleEnter:( text:string )=>any;
  handleChange:( text:string )=>any;

  set_broad_state:BroadcastState;
  handleSend:(
    broadcast_id_1:number,
    broadcast_id_2:number,
    share_id_1:number,
    share_id_2:number
  )=>any;
}
function _TextShareCenter( props:TextShareCenterProps )
{
  // --[[ init ]]
  const [ text, setText ] = useState<string>(props.set_text);
  const [ broad_id, setBroadID ] = useState<string>("");
  const [ share_id, setShareID ] = useState<ShareID>(props.set_share_id);
  const [ state_broadcast, setStateBroad ] = useState<boolean>(false);


  // --[[ function - text ]]
  // --[ text ]
  function settingText()
  {
    setText(props.set_text);
  }
  useEffect(settingText, [props.set_text]);
  function onChangeText( e:ChangeEvent )
  {
    const target:HTMLTextAreaElement = e.target as any;
    const conv_text = target.value.replaceAll('\n','').replaceAll('\r','').replaceAll('\r\n','');
    setText(conv_text);
    (window as any).tt = props.handleChange;
    props.handleChange(conv_text);
  }
  function onKeyUpText( e:KeyboardEvent )
  {
    // -- 완료 문자 검사.
    if ( e.key == "Enter" )
      // -- 콜백 호출.
      props.handleEnter(text);
  }
  // --[ upload btn ]
  function onClickUpload( e:MouseEvent )
  {
    props.handleEnter(text);
  }
  // --[ broadcast id ]
  function onChangeBroadID( e:ChangeEvent<HTMLInputElement> )
  {
    //? 숫자가 아닌 경우 입력하지 않음.
    if ( !/^[0-9]{0,4}$/.test(e.target.value) ) return;
    setBroadID(e.target.value);
  }
  function onKeyUpBroadID( e:KeyboardEvent )
  {
    if (ex(
      e.key == "Enter",
      share_id.state == StateShareID.upload_success
    )) return;
    
    const result = broadcastIDParser(broad_id);
    if ( result.success )
    {
      props.handleSend(result.id_1, result.id_2, share_id.share_id_1, share_id.share_id_2);
    }
  }
  function wrappBroadState():boolean
  {
    return( !state_broadcast );
  }
  function settingBroadcastState()
  {
    //? 대기 중이 아닐 때에는, 즉 전송 후 기다리는 중이거나 전송이 완료되거나 전송 실패 후에.
    if ( props.set_broad_state.state != feedback.yet )
    {
      // -- 브로드캐스트 전송 아이디 지우기.
      setBroadID("");
    }
  }
  useEffect(settingBroadcastState, [props.set_broad_state]);
  function settingBroadcastActive()
  {
    //////////////////////////////
    console.log(`브로드스탯 변경:`, share_id.state == StateShareID.upload_success);
    setStateBroad(share_id.state == StateShareID.upload_success);
  }
  useEffect(settingBroadcastActive, [share_id.state]);
  // --[ share id ]
  function settingShareID()
  {
    setShareID(props.set_share_id);
  }
  useEffect(settingShareID, [props.set_share_id]);


  return(
    <div className={style.Center}>
      <div className={style._box}>
        <div className={style.box}>
          <textarea
            className={style._input}
            placeholder="Enter Text... or Drag and Drop Text"
            onChange={onChangeText}
            onKeyUp={onKeyUpText}
            value={text}
          />
          <div
            className={style.upload_btn}
            onClick={onClickUpload}
          />
        </div>
      </div>
      <div className={style._share_box}>
        <div className={style._send}>
          <div className={style.send}>
            <input
              className={style.send_input}
              type="text"
              inputMode="numeric"
              placeholder="Enter Broadcast ID..."
              onChange={onChangeBroadID}
              value={broad_id}
              onKeyUp={onKeyUpBroadID}
              readOnly={wrappBroadState()}
            />
            <div className={style.send_btn}>{feedBroadcast(props.set_broad_state)}</div>
          </div>
        </div>
        <div className={style._share}>
          <div className={style.share}>
            <div className={style.share_txt}>share your code</div>
            <div className={style.share_code}>{feedShareID(share_id)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}


// --[ file center ]
interface FileShareCenterProps{
  set_files:FileInfo[];
  set_share_id:ShareID;
  handleAddFiles:( files:File[] )=>any;
  handleUploadBtn:()=>any;
  handleFileListLocalFilter:()=>any;

  set_broad_state:BroadcastState;
  handleSend:(
    broadcast_id_1:number,
    broadcast_id_2:number,
    share_id_1:number,
    share_id_2:number
  )=>any;
}
function _FileShareCenter( props:FileShareCenterProps )
{
  // --[[ init ]]
  // const [ files, setFiles ] = useState<File[]>(props.set_files);
  const [ files_form, setForm ] = useState<FormData>(new FormData());
  const [ broad_id, setBroadID ] = useState<string>("");
  const [ share_id, setShareID ] = useState<ShareID>(props.set_share_id);
  const form = useRef<HTMLInputElement>(null);

  
  // --[[ function ]]
  // --[ add files ]
  function onClickAddFiles( e:MouseEvent )
  {
    form.current?.click();
    //? 만약 공유된 파일을 가져온 상태인 경우 지우기 위해 호출.
    props.handleFileListLocalFilter();
  }
  function onChangeFilesForm( e:ChangeEvent )
  {
    if ( form.current == null || form.current.files == null ) return;
    props.handleAddFiles(Array.from(form.current.files));
  }
  // --[ upload btn ]
  function onClickUpload( e:MouseEvent )
  {
    props.handleUploadBtn();
  }
  // --[ download btn ]
  function handleDownload( file_id:number )
  {
    // fetch(base_url+"/get-data-file/"+String(file_id), getmethod()).then().catch(reqError)
    // .then().catch(reqError);
    window.open(base_url+"/get-data-file/"+String(file_id));
  }
  // --[ broadcast id ]
  function onChangeBroadID( e:ChangeEvent<HTMLInputElement> )
  {
    //? 숫자가 아닌 경우 입력하지 않음.
    if ( !/^[0-9]{0,4}$/.test(e.target.value) ) return;
    setBroadID(e.target.value);
  }
  function onKeyUpBroadID( e:KeyboardEvent )
  {
    //? 엔터, 데이터의 공유 아이디가 발급된 상태일 때만 절차 계속.
    if (ex(
      e.key == "Enter",
      share_id.state == StateShareID.upload_success
    )) return;

    // -- 파싱하기.
    const result = broadcastIDParser(broad_id);
    if ( result.success == false ) return;
    props.handleSend(
      result.id_1,
      result.id_2,
      share_id.share_id_1,
      share_id.share_id_2,
    );
  }
  function settingBroadcastState()
  {
    if ( props.set_broad_state.state != feedback.yet )
    {
      setBroadID("");
    }
  }
  useEffect(settingBroadcastState, [props.set_broad_state]);
  // --[ share id ]
  function settingShareID()
  {
    setShareID(props.set_share_id);
  }
  useEffect(settingShareID, [props.set_share_id]);
  // function settingFiles()
  // {
  //   setFiles(props.set_files);
  // }
  // useEffect(settingFiles, [props.set_files]);
  // --[ file list display ]
  // function FileItem( props:{file_name:string,file_size:number} )
  function FileItem( props:{ file_info:FileInfo } )
  {
    if ( props.file_info.file == null )
      return(
        <></>
      );


    const file_name:string = props.file_info.file.name;
    const file_size:string = bytesToSize(props.file_info.file.size);
    
    
    return(
      <div className={style.file_item}>
        <div className={style.name}>{file_name}</div>
        <div className={style.size}>{file_size}</div>
      </div>
    );


    // return(
    //   <div className={style.file_item}>
    //     <div className={style.name}>{props.file_name}</div>
    //     <div className={style.size}>{bytesToSize(props.file_size)}</div>
    //   </div>
    // );
  }
  interface SharedFileItemProps{
    file_info:FileInfo;
  };
  function SharedFileItem( props:SharedFileItemProps )
  {
    if ( props.file_info.shared_file_id == null )
      return(
        <></>
      );
    
    const file_name:string = props.file_info.shared_file_name;

    function onClickDownload( e:MouseEvent )
    {
      if ( props.file_info.shared_file_id == null ) return;
      handleDownload(props.file_info.shared_file_id);
    }
    
    return(
      <div className={style.file_item} onClick={onClickDownload}>
        <div className={style.name}>{file_name}</div>
        <div className={style.download_btn}></div>
      </div>
    );
  }
  function FileList()
  {
    return(
      <div className={style._file_list}>
        {
          props.set_files.map(( file_info )=>{
            if ( file_info.is_shared_file == true )
              return( <SharedFileItem key={ID()} file_info={file_info}/> );
            else
              return( <FileItem key={ID()} file_info={file_info}/> );
          })
        }
      </div>
    );
  }


  return(
    <div className={style.Center}>
      <div className={style._box}>
        <div className={style.box}>
          <div
            className={style.add_files_btn}
            onClick={onClickAddFiles}
          />
          <input
            className={style.files_form}
            type="file"
            formEncType="multipart/form-data"
            multiple
            ref={form}
            onChange={onChangeFilesForm}
          />
          <div className={style._input}>
            <FileList/>
          </div>
          <div
            className={style.upload_btn}
            onClick={onClickUpload}
          />
        </div>
      </div>
      <div className={style._share_box}>
        <div className={style._send}>
          <div className={style.send}>
            <input
              className={style.send_input}
              type="text"
              inputMode="numeric"
              placeholder="Enter Broadcast ID..."
              onChange={onChangeBroadID}
              value={broad_id}
              onKeyUp={onKeyUpBroadID}
              readOnly={share_id.state != StateShareID.upload_success}
            />
            <div className={style.send_btn}>{feedBroadcast(props.set_broad_state)}</div>
          </div>
        </div>
        <div className={style._share}>
          <div className={style.share}>
            <div className={style.share_txt}>share your code</div>
            <div className={style.share_code}>{feedShareID(share_id)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}


// --[ Broadcast center ]
interface BroadcastCenterProps{
  set_pickup_list:PickupInfo[];
  handlePickupItemClick:( pickup_info:PickupInfo )=>any;
}
function _BroadcastCenter( root_props:BroadcastCenterProps )
{
  // --[[ init ]]

  
  // --[[ component ]]
  function PickupItem( props:{pickup_info:PickupInfo} )
  {
    const type = props.pickup_info.type;
    const id_1 = props.pickup_info.id_1.toString().padStart(2, '0');
    const id_2 = props.pickup_info.id_2.toString().padStart(2, '0');

    // --[[ function ]]
    // --[ click ]
    function onClickPickupItem( e:MouseEvent )
    {
      root_props.handlePickupItemClick(props.pickup_info);
    }
    return(
      <div
        className={and(
          style.item,
          Centermap(dataobjMap(type)as CenterMode)
        )}
        onClick={onClickPickupItem}
      >
        <div className={style._info}>
          <div className={style.info}/>
        </div>
        <div className={style._broadcast_id}>
          <div className={style.broadcast_id}>{id_1} {id_2}</div>
        </div>
      </div>
    );
  }
  function wrapPickupList():any[]
  {
    function cb( v:PickupInfo, i:number )
    {
      return(
        <PickupItem pickup_info={v}/>
      );
    }
    return(
      root_props.set_pickup_list.map(cb)
    );
  }


  return(
    <div className={style.Center}>
      <div className={style._box}>
        <div className={style.box}>
          <div className={style._input}>
            <div className={style._pickup_list}>

              {wrapPickupList()}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

enum CenterMode{
  text = 'text',
  memo = 'memo',
  file = 'file',
  broadcast = 'broadcast',
  storage = 'storage',
}
function Centermap( mode:CenterMode ):string
{
  switch ( mode )
  {
    default:
    case CenterMode.text:return( style.text );
    case CenterMode.memo:return( style.memo );
    case CenterMode.file:return( style.file );
    case CenterMode.broadcast:return( style.broadcast );
    case CenterMode.storage:return( style.storage );
  }
}
function DisplayCenter( props:{props:ShareCenterProps} )
{
  switch ( props.props.mode )
  {
    default:
    case CenterMode.text:return(
      <_TextShareCenter
        set_text={props.props.set_text}
        set_share_id={props.props.set_share_id}
        handleEnter={props.props.handleEnterText}
        handleChange={props.props.handleChangeText}

        set_broad_state={props.props.set_send_state}
        handleSend={props.props.handleSend}
      />
    );
    case CenterMode.file:return(
      <_FileShareCenter
        set_share_id={props.props.set_share_id}
        set_files={props.props.set_files}
        handleUploadBtn={props.props.handleUploadBtn}
        handleAddFiles={props.props.handleAddFiles}
        handleFileListLocalFilter={props.props.handleFileListLocalFilter}

        set_broad_state={props.props.set_send_state}
        handleSend={props.props.handleSend}
      />
    );
    case CenterMode.broadcast:return(
      <_BroadcastCenter
        set_pickup_list={props.props.set_pickup_list}
        handlePickupItemClick={props.props.handlePickupItemClick}
      />
    );
  }
}



interface ShareCenterProps{
  mode:CenterMode;
  handlePickupItemClick:( pickup_info:PickupInfo )=>any;

  set_send_state:BroadcastState;
  handleSend:(
    broadcast_id_1:number,
    broadcast_id_2:number,
    share_id_1:number,
    share_id_2:number
  )=>any;

  set_text:string;
  set_share_id:ShareID;
  handleChangeText:( text:string )=>any;
  handleEnterText:( text:string )=>any;

  set_files:FileInfo[];
  handleAddFiles:( files:File[] )=>any;
  handleUploadBtn:()=>any;
  handleFileListLocalFilter:()=>any;

  set_pickup_list:PickupInfo[];
}
function ShareCenter( props:ShareCenterProps )
{
  return(
    <>
      <div className={Centermap(props.mode)}>
        <div className={style.ShareCenter}>
          <div className={style.share_center}>
            <div className={style._title}>
              <div className={style.title}>Share Center</div>
            </div>
            <div className={style._control}>
              <DisplayCenter props={props}/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


export{
  ShareCenter,
  CenterMode,
}