import { WheelEvent, SyntheticEvent } from "react";
import { dataobjType } from "./classRequest";

let _ID_count = 0;
function ID():number
{
  if ( _ID_count == undefined ) _ID_count = 0;
  return( _ID_count++ );
}
ID();

function ex( ...args:any[] ):boolean
{
  for ( const v of args )
    if ( !v ) return( true );
  return( false );
}
function and( ...str:string[] )
{
  return( str.join(' ') );
}
function isNAN( numeric:number ):boolean
{
  if ( numeric != numeric ) return( true );
  return( false );
}

// -- 바이트 단위 변환.
//? 출처 : "https://aspdotnet.tistory.com/2956"
function bytesToSize(bytes:number)
{
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.floor(Math.log(bytes) / Math.log(1024)));
  if (i === 0) return `${bytes} ${sizes[i]}`
  return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`
}

// --[ 스크롤바 제거 ]
class ClearScroll{
  private id:string = "";
  constructor( id:string )
  {
    if ( id.length == 0 ) throw new Error("ClearScroll은 id 변수가 빈 문자열이 되어선 안됩니다.");
    this.id = id;
  }
  
  init = ( dom:HTMLElement )=>{
    // -- 기본 스크롤 설정 지우기.
    dom.style.overflow = "hidden";
  };
  onScroll = ( e:WheelEvent )=>{
    const scroll_height = e.currentTarget.scrollHeight;
    const dom_height = e.currentTarget.clientHeight;
    // -- 스크롤 가능할 경우.
    if ( dom_height < scroll_height )
    {
      //? 체크 표시.
      e.currentTarget.id = this.id;
      const on_id = (e.target as HTMLElement).id;
      // -- 다른 스크롤 돔에서 마우스 스크롤을 하는 경우는 무시하기.
      if ( on_id != "" && on_id != this.id ) return;
      e.currentTarget.scrollTop += e.deltaY;
    }
    //? 스크롤 안되는 경우.
    else
    {
      //? 체크 지우기.
      e.currentTarget.id = "";
    }
  };
}

// --[ 데이터베이스 ]
interface DBskin{
  data_info_list:{ data_id:number, type:dataobjType }[],
}
const DB = {
  storage_name:"share-station-01",
  init(){
    if ( localStorage.getItem(this.storage_name) )return;

    const obj:DBskin = {
      data_info_list:[],
    };
    localStorage.setItem(this.storage_name, JSON.stringify(obj));
  },
  set_data( data_id:number, type:dataobjType ){
    let value = localStorage.getItem(this.storage_name);
    if ( !value ) return;
    const json:DBskin = JSON.parse(value);
    json.data_info_list.push({ data_id, type });
    localStorage.setItem(this.storage_name, JSON.stringify(json));
  },
  get_data(){
    let value = localStorage.getItem(this.storage_name);
    if ( value == null ) return;
    const json:DBskin = JSON.parse(value);
    return( json );
  },
};

// --[ time ]
function getTime():number
{
  return( new Date().getTime() );
}
function calcTime( day:number, h:number, m:number, s:number ):number
{
  return( (1000*s)+(1000*60*m)+(1000*60*60*h)+(1000*60*60*24*day) );
}



export{
  and,
  ClearScroll,
  DB,
  ex,
  bytesToSize,
  ID,
  isNAN,
  getTime,
  calcTime,
};
export type{
  DBskin,
};
