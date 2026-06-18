///index.tsx
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";

import { Link } from "expo-router";

import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView, StyleSheet, Text, View
} from "react-native";

import {
    onAuthStateChanged, signInWithEmailAndPassword
} from "firebase/auth";


export default function Index(){
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [user, setUser] = useState<any>(null); // Ver se ta logado

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if(u) setEmail(u.email ?? "");
        });
        return unsub;
    }, []);

    async function handleLogin() {
        if (!email || !senha) {
            Alert.alert("Erro", "Preencha e-mail e senha!");
            return;
        }

        try {
            console.log("Login --> ", email.trim());
            const logged = await signInWithEmailAndPassword(auth, email.trim(), senha);
            Alert.alert("Login Ok", `Bem-vindo ${logged.user.email}`);
        } catch (error: any) {
            console.log("Login failed ", error);
            Alert.alert("Erro no Login", error.message);
        }
    }

    return (
        <KeyboardAvoidingView 
            style={{flex:1}}
            behavior={Platform.select({ios:"padding", android:"height"})}
        >
            <ScrollView contentContainerStyle={{ flexGrow:1 }}>
                <View style={styles.container}>
                    {/* ... Imagem e Textos ... */}
                    
                    <View style={styles.form}>
                        <Input 
                            placeholder="E-mail" 
                            keyboardType="email-address" 
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <Input 
                            placeholder="Senha" 
                            secureTextEntry
                            value={senha}
                            onChangeText={setSenha}
                        />
                        
                        <Button label="Entrar" onPress={handleLogin} />
                    </View>

                    <Text style={styles.footerText}>Não tem uma conta? 
                        <Link href="/signup" style={styles.footerLink}>
                            {" "}Cadastre-se aqui
                            {"\n\n"}
                        </Link>
                        <Link href="/cadastro" style={styles.footerLink}>
                            {" "}Tela de cadastro
                        </Link>
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: "#FDFDFD",
        padding:32
    },
    ilustration:{
        width: "100%",
        height: 330,
        resizeMode:"contain",
        marginTop:62
    }, 
    footerText:{
        textAlign:"center",
        marginTop:24,
        color:"#585860",
    },
    footerLink:{
        color:"#0929b8",
        fontWeight:700
    },
    form: {
        marginTop:24,
        gap:12
    },
    title:{ 
        fontSize: 32,
        fontWeight:900,
    },
    subtitle:{
        fontSize:16,
    },    
})