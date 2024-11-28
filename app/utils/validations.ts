import { cpf } from "cpf-cnpj-validator";

export function validateCPF(cpfinput: string) {
        if (cpf.isValid(cpfinput)) {
            return cpf.format(cpfinput) 
          } else {
            return false
          }
    }

