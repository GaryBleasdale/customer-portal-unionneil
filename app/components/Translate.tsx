import ptBr from "../translations/pt-BR.json";
import en from "../translations/en.json";

export default function Translate({ children }: { children: React.ReactNode }) {
  const text = children;
  const broswerLang = navigator.language;

  function translation() {
    if (broswerLang === "pt-BR") {
      const pageGroup = text.split(".")[0];
      const content = text.split(".")[1];
      return ptBr[pageGroup][content];
    }
    if (broswerLang === "en-US") {
      const pageGroup = text.split(".")[0];
      const content = text.split(".")[1];
      return en[pageGroup][content];
    }
  }

  return <div>{translation()}</div>;
}
