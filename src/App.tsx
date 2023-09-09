import { and } from './utiles';
import style from './App.module.scss';
import { MainControlTower } from './ShareStation/ShareStation';
import { UIEvent, WheelEvent, useState } from 'react';

class DeadScroll{
  onScroll( e:WheelEvent<HTMLDivElement> )
  {
    e.currentTarget.scrollTop += e.deltaY;
  }
}

function App()
{
  return(
    <div className={style.viewframe}>
      <MainControlTower/>
    </div>
  );
  
  // return(
  //   <div className={style.viewframe}>
  //     <div className={style._header}>
  //       <div className={style.header}>
  //         <div className={style._logo}>
  //           <div className={style.logo}/>
  //         </div>
  //       </div>
  //     </div>
  //     <div className={style._body}>
  //       <div className={style.body}>
  //         <div className={style._left} onWheel={a.onScroll}>

  //           <TextStation
  //             selected={true}
  //             ptr_text={{text:''}}
  //             set_text=''
  //           ></TextStation>

  //           <TextStation
  //             selected={false}
  //             ptr_text={{text:''}}
  //             set_text=''
  //           ></TextStation>

  //           <TextStation
  //             selected={false}
  //             ptr_text={{text:''}}
  //             set_text=''
  //           ></TextStation>

  //           <TextStation
  //             selected={false}
  //             ptr_text={{text:''}}
  //             set_text=''
  //           ></TextStation>

  //           <TextStation
  //             selected={false}
  //             ptr_text={{text:''}}
  //             set_text=''
  //           ></TextStation>

  //         </div>
  //         <div className={style._right}></div>
  //       </div>
  //     </div>
  //   </div>
  // );
}

export default App;