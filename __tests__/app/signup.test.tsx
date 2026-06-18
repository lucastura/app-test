import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Alert } from "react-native";
import Signup from "../../src/app/signup";

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock("../../src/lib/firebase", () => ({
  auth: {},
}));

jest.mock("expo-router", () => {
  const { Text } = require("react-native");
  return {
    Link: ({ children }: any) => <Text>{children}</Text>,
  };
});

jest.spyOn(Alert, "alert");

// título da tela e label do botão são ambos "Cadastrar" — index 1 é sempre o botão
function getCadastrarButton() {
  return screen.getAllByText("Cadastrar")[1];
}

describe("Tela de Cadastro (src/app/signup.tsx)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve exibir alerta de erro se as senhas não forem iguais", async () => {
    await render(<Signup />);

    await fireEvent.changeText(screen.getByPlaceholderText("Senha"), "senha123");
    await fireEvent.changeText(screen.getByPlaceholderText("Confirmar Senha"), "senhaDiferente");
    await fireEvent.press(getCadastrarButton());

    expect(Alert.alert).toHaveBeenCalledWith("Erro", "As senhas não são iguais");
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("deve chamar createUserWithEmailAndPassword e exibir alerta de sucesso", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: { uid: "12345" },
    });

    await render(<Signup />);

    await fireEvent.changeText(screen.getByPlaceholderText("Nome"), "Usuário Teste");
    await fireEvent.changeText(screen.getByPlaceholderText("E-mail"), " teste@teste.com ");
    await fireEvent.changeText(screen.getByPlaceholderText("Senha"), "senhaSegura123");
    await fireEvent.changeText(screen.getByPlaceholderText("Confirmar Senha"), "senhaSegura123");

    await fireEvent.press(getCadastrarButton());

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "teste@teste.com",
        "senhaSegura123"
      );
      expect(Alert.alert).toHaveBeenCalledWith("Sucesso!", "Conta criada com sucesso");
    });
  });

  it("deve exibir alerta de e-mail já em uso", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: "auth/email-already-in-use",
    });

    await render(<Signup />);

    await fireEvent.changeText(screen.getByPlaceholderText("E-mail"), "usado@teste.com");
    await fireEvent.changeText(screen.getByPlaceholderText("Senha"), "senha123");
    await fireEvent.changeText(screen.getByPlaceholderText("Confirmar Senha"), "senha123");
    await fireEvent.press(getCadastrarButton());

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Esse email já está em uso");
    });
  });

  it("deve exibir alerta informando que o e-mail é inválido", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: "auth/invalid-email",
    });

    await render(<Signup />);

    await fireEvent.changeText(screen.getByPlaceholderText("E-mail"), "email-errado");
    await fireEvent.changeText(screen.getByPlaceholderText("Senha"), "senha123");
    await fireEvent.changeText(screen.getByPlaceholderText("Confirmar Senha"), "senha123");
    await fireEvent.press(getCadastrarButton());

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("E-Mail inválido");
    });
  });

  it("deve exibir alerta genérico para outros erros", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: "auth/weak-password",
    });

    await render(<Signup />);

    await fireEvent.changeText(screen.getByPlaceholderText("E-mail"), "teste@teste.com");
    await fireEvent.changeText(screen.getByPlaceholderText("Senha"), "123");
    await fireEvent.changeText(screen.getByPlaceholderText("Confirmar Senha"), "123");
    await fireEvent.press(getCadastrarButton());

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Erro desconhecido ao criar conta");
    });
  });
});