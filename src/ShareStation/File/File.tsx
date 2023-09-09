// --[[ import ]]
import { memo, useRef, useState, useEffect, useMemo, ChangeEvent, KeyboardEvent, MouseEvent, DragEvent, useReducer } from "react";
import { ClearScroll, and } from "../../utiles";
import style from "./../Text/Text.module.scss";


// --[[ 텍스트 스태이션 ]]
interface FileStationProps{
  handleClick:()=>any;

  handleAddFiles:( files:File[] )=>any;
}
function FileStation( props:FileStationProps )
{
  // -- init
  // const scroll_id = "text_box";
  // const scroll = useRef(new ClearScroll(scroll_id));
  const [ drop_state, setDropState ] = useReducer<(state:string,action:'enter'|'leave')=>string>(redDropState, "");


  // -- function
  // --[ drop state ]
  function redDropState( state:string, action:'enter'|'leave' )
  {
    if ( action == 'enter' )
      return( style.dragenter );
    else if ( action == 'leave' )
      return( "" );
    else
      return( "" );
  }
  function onClickStation( e:MouseEvent ) { props.handleClick() }
  function onDragenter( e:DragEvent )
  {
    props.handleClick();
    setDropState("enter");
  }
  function onDragover( e:DragEvent )
  {
    e.preventDefault();
  }
  function onDragleave( e:DragEvent )
  {
    setDropState("leave");
  }
  function onDrop( e:DragEvent )
  {
    props.handleClick();
    e.preventDefault();
    setDropState("leave");
    props.handleAddFiles(Array.from(e.dataTransfer.files));
  }
  
  
  // -- return
  return(
    <div className={"STATION_BOX"}>
      <div className={style.file}></div>
      <div
        className={style.Station}
        onClick={onClickStation}
      >
        <div className={style.station}>
          <div className={style._left}>
            <div className={style.title}/>
          </div>
          <div className={style._right}>
            <div className={style._file_list_box}>
              <div
                className={and(
                  style.file_list_box,
                  drop_state,
                )}
                onDragEnter={onDragenter}
                onDragOver={onDragover}
                onDragLeave={onDragleave}
                onDrop={onDrop}
              >
                {"Drag and Drop Files Here"}
                <br/>
                {"or"}
                <br/>
                {"Click Here"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default memo(FileStation);