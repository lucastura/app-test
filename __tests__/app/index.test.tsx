import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Alert } from "react-native";
import Index from "../../src/app/index";

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  }),
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

describe("Tela de Login (src/app/index.tsx)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve exibir alerta de erro se e-mail ou senha estiverem vazios", async () => {
    await render(<Index />);

    await fireEvent.press(screen.getByText("Entrar"));

    expect(Alert.alert).toHaveBeenCalledWith("Erro", "Preencha e-mail e senha!");
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("deve chamar signInWithEmailAndPassword e exibir alerta de sucesso", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: { email: "teste@teste.com" },
    });

    await render(<Index />);

    await fireEvent.changeText(screen.getByPlaceholderText("E-mail"), "teste@teste.com ");
    await fireEvent.changeText(screen.getByPlaceholderText("Senha"), "senhaSegura123");
    await fireEvent.press(screen.getByText("Entrar"));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "teste@teste.com",
        "senhaSegura123"
      );
      expect(Alert.alert).toHaveBeenCalledWith("Login Ok", "Bem-vindo teste@teste.com");
    });
  });

  it("deve exibir alerta de erro caso o login falhe", async () => {
    const errorMessage = "Firebase: Error (auth/invalid-credential).";
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    await render(<Index />);

    await fireEvent.changeText(screen.getByPlaceholderText("E-mail"), "teste@teste.com");
    await fireEvent.changeText(screen.getByPlaceholderText("Senha"), "senhaErrada");
    await fireEvent.press(screen.getByText("Entrar"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Erro no Login", errorMessage);
    });
  });
});