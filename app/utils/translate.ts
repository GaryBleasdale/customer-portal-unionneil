import ptBr from "../translations/pt-BR.json";
import en from "../translations/en.json";

const isServer = typeof window === 'undefined';

export default function T(text:string) {

  if (isServer) {
    return "";
  }

  const browserLang = navigator.language;
  switch (browserLang) {
    case "pt-BR":
    case "pt":
    case "pt-PT":
      return translator(text, ptBr);
    case "en-US":
    case "en":
    case "en-GB":
    case "en-AU":
    case "en-CA":
    case "en-IE":
    case "en-NZ":
    case "en-ZA":
      return translator(text, en);
    default:
      return translator(text, ptBr);
  }
}

function translator(text:string, lang:unknown){
    const pageGroup = text.split(".")[0];
    const content = text.split(".")[1];
    const subcontent = text.split(".")[2];
    
    if(subcontent){
      console.log(subcontent, content, pageGroup);
      return lang[pageGroup][content][subcontent];
    }
    return lang[pageGroup][content];
}
