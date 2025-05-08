import { CrudFile } from "./CrudFile.js";
import { env } from "../config/env.js";
import { normalizeText } from "../lib/normalizeText.js";

/**
 *
 * @param {Array<{ sector: string, equipment: string, serie: string }>} data
 *
 * Um objeto com quatro listas separadas de ativos, classificadas por tipo.
 *
 * @returns {{
 *   computer: Array<Object>,
 *   monitor: Array<Object>,
 *   printer: Array<Object>,
 *   others: Array<Object>
 * }}
 *
 */

export function assetProcessor(data) {
  const computer = data.filter(
    (value) => value.equipment.toLowerCase() === "CPU".toLowerCase()
  );

  const monitor = data.filter(
    (value) => value.equipment.toLowerCase() === "monitor".toLowerCase()
  );

  const printer = data.filter(
    (value) => value.equipment.toLowerCase() === "impressora".toLowerCase()
  );

  const others = data.filter(
    (value) =>
      value.equipment.toLowerCase() !== "cpu".toLowerCase() &&
      value.equipment.toLowerCase() !== "monitor".toLowerCase() &&
      value.equipment.toLowerCase() !== "impressora".toLowerCase()
  );

  return {
    computer,
    monitor,
    printer,
    others,
  };
}

/**
 * Transforma uma estrutura de dados contendo listas de equipamentos por categoria,
 * atualizando o nome do setor com base na parte à direita do delimitador "=>".
 *
 * @param {Object} data - Objeto com quatro propriedades: `computer`, `monitor`, `printer`, e `others`.
 * Cada propriedade deve conter um array de objetos com os campos:
 *   - `sector`: string com formato "antigo => novo"
 *   - `idSector`: string com id do sector"
 *   - `equipment`: string com o nome do equipamento
 *   - `serie`: string com o número de série do equipamento
 *
 * @returns {Object} Um novo objeto com as mesmas propriedades (`computer`, `monitor`, `printer`, `others`),
 * onde cada item tem o `sector` atualizado (somente a parte após "=>").
 *
 */

export async function mapUpdateSectorId(data) {
  const result = await new CrudFile({ path: env.SECTOR })._Read();
  const dataJson = JSON.parse(result);

  const newData = [];

  for (const key in data) {
    newData.push(
      data[key]
        .map((value) => {
          const filterData = dataJson.filter((id) =>
            normalizeText(id.sector).includes(
              normalizeText(value.sector).trim().split("=>")[1]
            )
          );

          if (value.sector.trim().split("=>")[1]) {
            return {
              sector: value.sector.trim().split("=>")[1],
              idSector: filterData.map((element) => element.id)[0],
              equipment: value.equipment,
              serie: value.serie,
            };
          }

          if (value.serie.toLowerCase() === "N/A".toLocaleLowerCase()) {
            return null;
          }

          const filterSector = dataJson.filter(
            (element) =>
              normalizeText(element.sector) === normalizeText(value.sector)
          );

          return {
            sector: filterSector[0].sector,
            idSector: filterSector[0].id,
            equipment: value.equipment,
            serie: value.serie,
          };
        })
        .filter(Boolean)
    );
  }

  newData.filter((value) => value);
  return {
    computer: [...newData[0]],
    monitor: [...newData[1]],
    printer: [...newData[2]],
    others: [...newData[3]],
  };
}
