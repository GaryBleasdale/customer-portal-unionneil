import * as React from "react";
import {
  Tailwind,
  Section,
  Img,
  Heading,
  Button,
  Font,
  Html,
  Head,
  Text,
  Preview,
} from "@react-email/components";

export default function BoletoEmail(props: any) {
  const { dueDate, boletoURL, faturaURL } = props;

  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Lato"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/lato/v17/S6u9w4BMUTPHh7USSwaPGR_p.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Boleto e Fatura da Union Neil</Preview>
      <Tailwind>
        <Section className="mt-[32px] text-center">
          <Text className="my-[16px] text-[18px] font-bold leading-[28px] text-gray-700">
            Vencimento no dia {dueDate}
          </Text>

          <Heading
            as="h1"
            className="m-0 mt-[8px] mb-6 text-[36px] font-semibold leading-[36px] text-gray-900"
          >
            Seu Boleto da UNION NEIL já chegou!
          </Heading>

          <Section className="mb-7 text-center w-full">
            <Button
              className="rounded-[8px] bg-yellow-500 px-[40px] py-[12px] font-bold text-white text-lg block max-full max-w-[200px] m-auto"
              href={boletoURL}
            >
              Acesse o Boleto
            </Button>
          </Section>
          <Section className="mb-5 text-center w-full">
            <Button
              className="rounded-[8px] bg-yellow-500 px-[40px] py-[12px] font-bold text-white text-lg block max-full max-w-[200px] m-auto"
              href={faturaURL}
            >
              Acesse a Fatura
            </Button>
          </Section>
        </Section>
        <Section className="text-center mt-5">
          <table className="w-full">
            <tr className="w-full">
              <td align="center">
                <Img
                  alt="Union Neil logo"
                  width="128"
                  src="https://unionneil.com.br/img/Union%20Neil%20Logo.png"
                />
              </td>
            </tr>
            <tr className="w-full">
              <td align="center">
                <Text className="my-[8px] text-[16px] font-semibold leading-[24px] text-gray-900">
                  Union Neil Ltda.
                </Text>
                <Text className="mb-0 mt-[4px] text-[16px] leading-[24px] text-gray-500">
                  CNPJ 48.768.101/0001-33
                </Text>
              </td>
            </tr>
            <tr>
              <td align="center">
                <Text className="text-[16px] font-semibold leading-[24px] text-gray-500">
                  Av. Washington Luiz 310 Torre White, sala 116 Jardim Emilia,
                  Sorocaba, SP, 18031-000, Brasil
                </Text>
              </td>
            </tr>
          </table>
        </Section>
      </Tailwind>
    </Html>
  );
}
