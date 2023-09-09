// --[[ import ]]
import { memo, useRef, useState, useEffect, useMemo, ChangeEvent, KeyboardEvent, MouseEvent, DragEvent, useReducer } from "react";
import { ClearScroll, and } from "../../utiles";
import style from "./../Text/Text.module.scss";
import { PickupInfo, StateBroadcast, feedback } from "../ShareStation";


// --[[ 텍스트 스태이션 ]]
interface BroadcastStationProps{
  handleClick:()=>any;

  set_new:boolean;
  set_get_state:feedback;
  set_state_broadcast:StateBroadcast;

  handleClickGet:( code_1:number, code_2:number )=>any;
}
function _BroadcastStation( props:BroadcastStationProps )
{
  // -- init
  const [ code, setCode ] = useState<string>("");


  // --[ function ]
  function onClickStation( e:MouseEvent ) { props.handleClick() }
  function handleGet()
  {
    props.handleClickGet(
      Number(code.substring(0, 2)),
      Number(code.substring(2, 4)),
    );
  }
  // -- broadcast id
  function wrapBroadcast():string
  {
    switch ( props.set_state_broadcast.state )
    {
      case feedback.yet:return( "loading..." );
      case feedback.wait:return( "generating ID..." );
      case feedback.success:
        const id_1 = props.set_state_broadcast.client_id_1.toString().padStart(2, '0');
        const id_2 = props.set_state_broadcast.client_id_2.toString().padStart(2, '0');
        return( `your ID : ${id_1} ${id_2}` );
      
      default:
      case feedback.fail:return( "generation fail" );
    }
  }
  // -- get btn
  function onClickGetbtn( e:MouseEvent )
  {
    if ( code.length < 4 ) return;
    handleGet();
  }
  function wrapGetbtn():string
  {
    switch ( props.set_get_state )
    {
      default:
      case feedback.yet:return( "get" );
      case feedback.wait:return( "wait..." );
      case feedback.success:return( "complate" );
      /////////////////////////// 괭장히 개발자 중심 주의인 사람이 쓰는 문구. 사용자 입장에서 적절한 문장을 사용하지 않음.
      case feedback.fail:return( "send fail" );
    }
  }
  // -- get input
  function onChangeCode( e:ChangeEvent<HTMLInputElement> )
  {
    if ( !/^[0-9]{0,4}$/.test(e.target.value) ) return;
    setCode(e.currentTarget.value);
  }
  function onKeyupCode( e:KeyboardEvent<HTMLInputElement> )
  {
    if ( e.code == "Enter" )
    {
      handleGet();
    }
  }
  
  
  // -- return
  return(
    <div className={"STATION_BOX"}>
      <div className={style.broadcast}></div>
      <div
        className={style.Station}
        onClick={onClickStation}
      >
        <div className={style.station}>
          <div className={style._left}>
            <div className={and(
              style.new_notifi,
              props.set_new?style.active:''
            )}/>
            <div className={style._title}>
              <div className={style.title}/>
            </div>
            <div className={style._id}>
              <div className={style.id}>{wrapBroadcast()}</div>
            </div>
          </div>
          <div className={style._right}>
            <div className={style._input}>
              <input
                className={style.code_input}
                type="text"
                inputMode="decimal"
                placeholder="share code..."
                onChange={onChangeCode}
                onKeyUp={onKeyupCode}
                value={code}
              />
              <div
                className={style.get_btn}
                onClick={onClickGetbtn}
              >{wrapGetbtn()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const BroadcastStation = memo(_BroadcastStation);
export default BroadcastStation;