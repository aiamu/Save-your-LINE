import React, { ReactNode, } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import icon from "./defaultIcon.png";
import { text } from 'stream/consumers';


function toggleGuide() {
  let target = document.getElementById("guideWindow")!;
  target.classList.toggle('toggle');
  target = document.getElementById('guidebutton')!;
  target.classList.toggle('toggle');
}

//Guide:ガイドボタンとガイドの内容
const Guide = () => {

  return (
    <>
      <button id='guidebutton' className='toggleButton' onClick={() => toggleGuide()}>
        ?
      </button>
      <div id="guideWindow" className='toggle'>
        <button id='guideCloseButton' onClick={() => toggleGuide()}>
          X
        </button>
        <div id="guideText">
          LINEアプリで生成したテキストファイルをこの下のボックスに与え、決定ボタンを押します。<br />
          あなたがやるべきことはこれだけです。<br />
          今のところは...
        </div>
      </div>
      <br />
    </>
  );
}

//Input:テキストファイルを受け取る
type InputProp = {
  read: () => void
}

const Input = (props: InputProp) => {
  return (
    <>
      <p>ここにLINEアプリで生成した.txtデータを入れてください。<br />
        改名・編集はしないでください。</p>
      <input type="file" id='fileInput' /><br />
      <input type="button" id='runButton' onClick={props.read} value='実行' />
    </>
  );
}

//Main:ライン風画面のメイン処理
type MainProp = {
  text: string | undefined,
  textNameLen: number | undefined,
  close: () => void,
}

const Main = (props: MainProp) => {
  if (props.text !== undefined) {
    let talklog: Array<ReactNode> = [];
    let logindex = 0;
    const textArray = props.text.split('\n');
    let rawTextArray: Array<string>;
    let nextrawText: string;

    const partner = props.text.substring(7, textArray[0].length - 7);
    console.log(partner);

    for (let i = 4; i < textArray.length; i++) {
      if (textArray[i] !== '') {
        rawTextArray = textArray[i].split(String.fromCodePoint(9))
        //メッセージが改行を含んでいる場合
        nextrawText = textArray[i + 1];
        while (nextrawText.split(String.fromCodePoint(9)).length === 1
          && (nextrawText !== ''
              || textArray[i + 2].charAt(5) !== '/'
              )
        ) {

          console.log(nextrawText);

          rawTextArray[2] = rawTextArray[2] + '\n' + nextrawText;


          i++;
          nextrawText = textArray[i + 1];
        }

        if (rawTextArray[1] === partner) {
          talklog[logindex] =
            <div key={logindex} className={'partner'}>
              <img src={icon} alt="アイコン" id='icon' />
              <span className='partnerMessage'>
                {rawTextArray[2].split(/(\n)/g).map(t => (t === '\n') ? <br /> : t)}
              </span>
              <span className='partnerTime'>
                {rawTextArray[0]}
              </span>
            </div >
        }
        else if (rawTextArray[1] !== undefined) {
          talklog[logindex] =
            <div key={logindex} className={'me'}>
              <span className='myTime'>
                {rawTextArray[0]}
              </span>
              <span className='myMessage' >
                {rawTextArray[2].split(/(\n)/g).map(t => (t === '\n') ? <br /> : t)}
              </span>
            </div>
        }
        else {
          talklog[logindex] =
            <div id='date'>
              {textArray[i]}
            </div>
        }
        logindex++;
      }
    }

    return (
      <div id='mainWindow' >
        <div id='header'>
          <input type="button" id='closeBottun' value="<" onClick={props.close} />
          {partner}
        </div>
        <br />
        <div>
        <div id='date'>
              {this.props.text}
            </div>
          {talklog}
        </div>
      </div>
    );
  }
  else {
    return (
      <></>
    );
  }

};

type Pagestate = {
  data: File | undefined;
  text: string | undefined;
  textNameLen: number | undefined;
}

class Page extends React.Component<{}, Pagestate> {
  constructor(props: {}) {
    super(props);
    this.state = {
      data: undefined,
      text: undefined,
      textNameLen: undefined,
    }
  }

  read() {
    //HTMLからデータを受け取る
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    const buf = fileInput.files!;

    //受け取りに成功していたら、内容を取り出す
    if (buf[0] !== undefined) {
      let dataReader = new FileReader();
      dataReader.readAsText(buf[0]);
      dataReader.onloadend = () => {
        this.setState({
          data: buf[0],
          text: dataReader.result as string,
          textNameLen: buf[0].name.length,
        })


      }
    }
  }

  close() {
    this.setState({
      text: undefined,
    });
  }


  render() {
    return (
      <div className='main'>
        <h1>Save your LINE!</h1>
        <Guide />
        <br />
        <Input read={() => this.read()} />
        <Main
          text={this.state.text}
          textNameLen={this.state.textNameLen}
          close={() => this.close()}
        />
      </div>
    );
  }
}


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Page />
);