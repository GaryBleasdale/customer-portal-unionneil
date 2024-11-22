import ptBr from "../translations/pt-BR.json";
import en from "../translations/en.json";

export default function T(text:string) {
  const broswerLang = navigator.language;
  switch (broswerLang) {
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
      return "";
  }
}

function translator(text:string, lang:unknown){
    const pageGroup = text.split(".")[0];
    const content = text.split(".")[1];
    const subcontent = text.split(".")[2];
    
    if(subcontent){
      return lang[pageGroup][content][subcontent];
    }
    return lang[pageGroup][content];
}
