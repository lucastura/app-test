import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Alert } from "react-native";

import { Link } from "expo-router";
import { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView, StyleSheet, Text, View
} from "react-native";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Signup(){
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmaSenha, setConfirmaSenha] = useState("");

    async function handleRegister() {
        if (senha !== confirmaSenha) {
            Alert.alert("Erro", "As senhas não são iguais");
            return;
        }  
        
        try{
            console.log("Tentando cadastrar ->", email.trim(),senha);
            const create = await createUserWithEmailAndPassword(auth, email.trim(), senha);

            console.log("Conta criada com sucesso! UID:", create.user.uid)
            Alert.alert("Sucesso!", "Conta criada com sucesso");
        } catch (error:any){
            console.log("Erro no cadastro:", error.code);
        

        ///Tratamento dos erros do firebase

        if (error.code === 'auth/email-already-in-use'){
            Alert.alert("Esse email já está em uso");
        } else if (error.code === 'auth/invalid-email'){
            Alert.alert("E-Mail inválido");
        }else{
            Alert.alert("Erro desconhecido ao criar conta");
        }
    }
}
    return(
        <KeyboardAvoidingView 
                    style={{flex:1}}
                    behavior={Platform.select({ios:"padding", android:"height"})}
        >
        <ScrollView 
            contentContainerStyle={{ flexGrow:1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.container}>
                <Image 
                    source={require('@/assets/image2.png')}
                    style={styles.ilustration} 
                />
                <Text style={styles.title}>Cadastrar</Text>
                <Text style={styles.subtitle}>Crie sua conta para acessar</Text>
                <View style={styles.form}>
                    <Input placeholder="Nome"  onChangeText={setNome}/>
                    <Input placeholder="E-mail" onChangeText={setEmail}
                    keyboardType="email-address" />
                    <Input placeholder="Senha" onChangeText={setSenha}
                    secureTextEntry/>
                    <Input placeholder="Confirmar Senha" onChangeText={setConfirmaSenha}
                    secureTextEntry/>
                    <Button label="Cadastrar" 
                        onPress={handleRegister}
                    />
                
                </View>
                <Text style={styles.footerText}>Já tem uma conta? 
                    <Link href="/" style={styles.footerLink}>
                        {" "}Entre aqui
                    </Link>
                </Text>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
    )
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