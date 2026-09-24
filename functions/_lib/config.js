import manifest from '../../public/config/projetos.json';

export function getProjeto(chave) {
  return manifest.projects[(chave || '').toLowerCase()] || null;
}

export function dbProjetoNome(projeto) {
  return projeto.dbProjeto || projeto.nome;
}

export default manifest;
