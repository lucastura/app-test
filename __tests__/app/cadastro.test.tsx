import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import Cadastro from "../../src/app/cadastro";

import { addDoc, deleteDoc, getDocs, updateDoc } from "firebase/firestore";

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

jest.mock("../../src/lib/firebase", () => ({
  db: {},
}));

jest.spyOn(Alert, "alert");

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

describe("Tela de Cadastro de Estoque (src/app/cadastro.tsx)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDocs as jest.Mock).mockResolvedValue(mockRegistros);
  });

  it("deve carregar e exibir os registros do banco ao abrir a tela", async () => {
    await render(<Cadastro />);

    await waitFor(() => {
      expect(getDocs).toHaveBeenCalled();
      expect(screen.getByText("Arroz")).toBeTruthy();
      expect(screen.getByText("Validade: 10/12/2026")).toBeTruthy();
      expect(screen.getByText("Quantidade: 50")).toBeTruthy();
    });
  });

  it("deve exibir alerta se tentar cadastrar produto com campos vazios", async () => {
    await render(<Cadastro />);

    await waitFor(() => expect(getDocs).toHaveBeenCalled());

    await fireEvent.press(screen.getByText("Cadastrar Produto"));

    expect(Alert.alert).toHaveBeenCalledWith("Aviso", "Preencha todos os campos do produto.");
    expect(addDoc).not.toHaveBeenCalled();
  });

  it("deve chamar addDoc com os dados corretos ao cadastrar um novo produto", async () => {
    await render(<Cadastro />);

    await waitFor(() => expect(getDocs).toHaveBeenCalled());

    await fireEvent.changeText(screen.getByPlaceholderText("Produto (ex: Arroz)"), "Feijão");
    await fireEvent.changeText(screen.getByPlaceholderText("Validade (ex: 10/12/2026)"), "01/01/2025");
    await fireEvent.changeText(screen.getByPlaceholderText("Quantidade (ex: 50)"), "10");

    await fireEvent.press(screen.getByText("Cadastrar Produto"));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          produto: "Feijão",
          validade: "01/01/2025",
          quantidade: "10",
        })
      );
      expect(Alert.alert).toHaveBeenCalledWith("Sucesso", "Produto cadastrado com sucesso!");
    });
  });

  it("deve preencher os inputs e alterar o botão ao clicar em Editar", async () => {
    await render(<Cadastro />);

    await waitFor(() => expect(screen.getByText("Arroz")).toBeTruthy());

    await fireEvent.press(screen.getByText("Editar"));

    expect(screen.getByPlaceholderText("Produto (ex: Arroz)").props.value).toBe("Arroz");
    expect(screen.getByPlaceholderText("Quantidade (ex: 50)").props.value).toBe("50");

    expect(screen.getByText("Atualizar Produto")).toBeTruthy();
    expect(screen.getByText("Cancelar Edição")).toBeTruthy();
  });

  it("deve chamar updateDoc ao editar e salvar um produto", async () => {
    await render(<Cadastro />);

    await waitFor(() => expect(screen.getByText("Arroz")).toBeTruthy());

    await fireEvent.press(screen.getByText("Editar"));
    await fireEvent.changeText(screen.getByPlaceholderText("Quantidade (ex: 50)"), "100");
    await fireEvent.press(screen.getByText("Atualizar Produto"));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith("Sucesso", "Produto atualizado com sucesso!");
    });
  });

  it("deve chamar deleteDoc ao clicar em Excluir", async () => {
    await render(<Cadastro />);

    await waitFor(() => expect(screen.getByText("Arroz")).toBeTruthy());

    await fireEvent.press(screen.getByText("Excluir"));

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});