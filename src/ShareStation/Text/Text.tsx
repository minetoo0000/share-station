// --[[ import ]]
import { memo, useRef, useState, useEffect, useMemo, ChangeEvent, KeyboardEvent, MouseEvent, FormEvent } from "react";
import { ClearScroll, and } from "../../utiles";
import style from "./Text.module.scss";


// --[[ 텍스트 스태이션 ]]
interface TextStationProps{
  handleClick:()=>any;
  
  set_text:string;
  handleEnter:( text:string )=>any;
  handleChange:( text:string )=>any;
}
function TextStation( props:TextStationProps )
{
  // -- init
  const scroll_id = "text_box";
  const scroll = useRef(new ClearScroll(scroll_id));
  const [ text, setText ] = useState<string>(props.set_text);


  // -- function
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
    (window as any).tt2 = props.handleChange;
    props.handleChange(conv_text);
  }
  function onKeyUp( e:KeyboardEvent )
  {
    // -- 완료 문자 검사.
    if ( e.key == "Enter" )
      // -- 콜백 호출.
      props.handleEnter(text);
  }
  function onClickStation( e:MouseEvent ) { props.handleClick() }
  
  
  // -- return
  return(
    <div className={"STATION_BOX"}>
      <div className={style.text}></div>
      <div className={style.Station} onClick={onClickStation}>
        <div className={style.station}>
          <div className={style._left}>
            <div className={style.title}/>
          </div>
          <div className={style._right}>
            <div className={style._text_box}>
              <textarea
                className={style.text_box}
                placeholder="Enter Text... or Drag and Drop Text then 'Enter'"
                onWheel={scroll.current.onScroll}
                ref={(dom)=>{
                  if ( !dom ) return;
                  scroll.current.init(dom as HTMLElement);
                }}
                onChange={onChangeText}
                onKeyUp={onKeyUp}
                value={text}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default memo(TextStation);