import React, { ReactNode, } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import icon from "./defaultIcon.png";

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
          LINEのトーク履歴とは、よく消失するもの。
          ですが、きっとこの世には大切な人との大切な会話の履歴をそのままの形で見ていたいと思う方もいらっしゃるでしょう。<br />
          そこで役立つのがこのSave your LINEです。トーク履歴のテキストファイルをこのサービスに与えて頂ければ、思い出の中の会話をそのままアナタにお見せできます。<br />
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
    let nextnextrawText: string;
    const partner = props.text.substring(7, textArray[0].length - 7);

    for (let i = 4; i < textArray.length - 1; i++) {
      if (textArray[i] !== '') {
        //一行を更に水平タブ区切りで分割
        //典型的なメッセージの行であれば、0番目は送信時間、2番目は送信者、3番目はメッセージの内容が入る。
        rawTextArray = textArray[i].split(String.fromCodePoint(9))

        /***メッセージが改行を含んでいる場合を処理する***/
        nextrawText = textArray[i + 1];
        nextnextrawText = textArray[i + 2]
        //典型的なメッセージの行の形式と違うならループに入る
        while (nextrawText.split(String.fromCodePoint(9)).length !== 3) {
          //単に一回改行され、次の行にメッセージの続きがある場合
          if (nextrawText !== '') {
            rawTextArray[2] = rawTextArray[2] + '\n' + nextrawText;
          }
          //エラー防止用
          else if(nextnextrawText === undefined){}
          //２行先のデータが日付データ(xxxx/xx/xx(x))でないなら、改行2連続以上のメッセージなので取得
          else if (nextnextrawText.charAt(4) !== '/' 
          || nextnextrawText.charAt(nextnextrawText.length-1) !== ')'
          || nextnextrawText.charAt(nextnextrawText.length-3) !== '('
          ) {
            rawTextArray[2] = rawTextArray[2] + '\n' + nextrawText;
          }
          //改行入りメッセージではなく日付データだったので処理終了
          else {
            break;
          }

          //次の行に移動、ファイル終端なら処理終了
          i++;
          if (i >= textArray.length - 1) {
            break;
          }
          nextrawText = textArray[i + 1];
          nextnextrawText = textArray[i + 2];
        }
        /***改行を含むメッセージの処理、ここまで***/

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
            <div id='date' key={logindex}>
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
            {textArray[3]}
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