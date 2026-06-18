import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import Cadastro from "../../src/app/cadastro"; // Ajuste o caminho se necessário

// --- 1. IMPORTANDO FUNÇÕES DO FIREBASE PARA OS MOCKS ---
import {
    addDoc,
    deleteDoc,
    getDocs,
    updateDoc
} from "firebase/firestore";

// --- 2. CONFIGURAÇÃO DOS MOCKS ---

// Mock do Firestore com todas as funções usadas no componente
jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  limit: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
  serverTimestamp: jest.fn(),
  updateDoc: jest.fn(),
}));

// Mock do banco de dados (db)
jest.mock("../../src/lib/firebase", () => ({
  db: {},
}));

// Espiona o Alerta
jest.spyOn(Alert, "alert");

// --- 3. DADOS FALSOS PARA TESTE ---
const mockRegistros = {
  docs: [
    {
      id: "doc_123",
      data: () => ({
        produto: "Arroz",
        validade: "10/12/2026",
        quantidade: "50",
      }),
    },
  ],
};

// --- 4. SUÍTE DE TESTES ---

describe("Tela de Cadastro de Estoque (src/app/cadastro.tsx)", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Por padrão, simula que o banco sempre retorna o nosso item "Arroz"
    (getDocs as jest.Mock).mockResolvedValue(mockRegistros);
  });

  it("deve carregar e exibir os registros do banco ao abrir a tela", async () => {
    const { getByText } = render(<Cadastro />);

    await waitFor(() => {
      // Verifica se a função de leitura do banco foi chamada
      expect(getDocs).toHaveBeenCalled();
      // Verifica se o item retornou e está na tela
      expect(getByText("Arroz")).toBeTruthy();
      expect(getByText("Validade: 10/12/2026")).toBeTruthy();
      expect(getByText("Quantidade: 50")).toBeTruthy();
    });
  });

  it("deve exibir alerta se tentar cadastrar produto com campos vazios", async () => {
    const { getByText } = render(<Cadastro />);
    
    // O componente tentará carregar os dados iniciais. Aguardamos a tela estabilizar.
    await waitFor(() => expect(getDocs).toHaveBeenCalled());

    // Clica em salvar sem preencher nada
    fireEvent.press(getByText("Cadastrar Produto"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Aviso", 
      "Preencha todos os campos do produto."
    );
    expect(addDoc).not.toHaveBeenCalled();
  });

  it("deve chamar addDoc com os dados corretos ao cadastrar um novo produto", async () => {
    const { getByPlaceholderText, getByText } = render(<Cadastro />);
    
    await waitFor(() => expect(getDocs).toHaveBeenCalled());

    // Preenche os campos
    fireEvent.changeText(getByPlaceholderText("Produto (ex: Arroz)"), "Feijão");
    fireEvent.changeText(getByPlaceholderText("Validade (ex: 10/12/2026)"), "01/01/2025");
    fireEvent.changeText(getByPlaceholderText("Quantidade (ex: 50)"), "10");

    // Simula a submissão
    fireEvent.press(getByText("Cadastrar Produto"));

    await waitFor(() => {
      // Verifica se o addDoc foi chamado contendo as informações digitadas
      expect(addDoc).toHaveBeenCalledWith(
        undefined, // Corresponde ao retorno do collection() mockado
        expect.objectContaining({
          produto: "Feijão",
          validade: "01/01/2025",
          quantidade: "10"
        })
      );
      expect(Alert.alert).toHaveBeenCalledWith("Sucesso", "Produto cadastrado com sucesso!");
    });
  });

  it("deve preencher os inputs e alterar o botão ao clicar em Editar", async () => {
    const { getByText, getByPlaceholderText } = render(<Cadastro />);

    // Aguarda o item "Arroz" aparecer na tela
    await waitFor(() => expect(getByText("Arroz")).toBeTruthy());

    // Clica no botão Editar do item
    fireEvent.press(getByText("Editar"));

    // Verifica se os inputs foram preenchidos com os dados do "Arroz"
    expect(getByPlaceholderText("Produto (ex: Arroz)").props.value).toBe("Arroz");
    expect(getByPlaceholderText("Quantidade (ex: 50)").props.value).toBe("50");
    
    // Verifica se os botões mudaram de estado
    expect(getByText("Atualizar Produto")).toBeTruthy();
    expect(getByText("Cancelar Edição")).toBeTruthy();
  });

  it("deve chamar updateDoc ao editar e salvar um produto", async () => {
    const { getByText, getByPlaceholderText } = render(<Cadastro />);

    await waitFor(() => expect(getByText("Arroz")).toBeTruthy());

    // Inicia a edição
    fireEvent.press(getByText("Editar"));

    // Altera a quantidade
    fireEvent.changeText(getByPlaceholderText("Quantidade (ex: 50)"), "100");

    // Salva a alteração
    fireEvent.press(getByText("Atualizar Produto"));

    await waitFor(() => {
      // Confirma se o updateDoc foi chamado e o alerta foi exibido
      expect(updateDoc).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith("Sucesso", "Produto atualizado com sucesso!");
    });
  });

  it("deve chamar deleteDoc ao clicar em Excluir", async () => {
    const { getByText } = render(<Cadastro />);

    // Aguarda o item "Arroz" aparecer na tela
    await waitFor(() => expect(getByText("Arroz")).toBeTruthy());

    // Clica em excluir
    fireEvent.press(getByText("Excluir"));

    await waitFor(() => {
      // Verifica se a função de deletar do Firestore foi acionada
      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});