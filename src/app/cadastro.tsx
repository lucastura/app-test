///cadastro.tsx

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

import {
  addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";

type Registro = { 
  id: string, 
  produto: string, 
  validade: string, 
  quantidade: string 
};

export default function Cadastro() {
  const [produto, setProduto] = useState("");
  const [validade, setValidade] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    carregarRegistros();
  }, []);

  async function salvarRegistro() {
    if (produto.trim() === "" || validade.trim() === "" || quantidade.trim() === "") {
      Alert.alert("Aviso", "Preencha todos os campos do produto.");
      return;
    }

    try {
      if (editandoId) {
        const docRef = doc(db, "registros_gerais", editandoId);
        await updateDoc(docRef, {
          produto: produto,
          validade: validade,
          quantidade: quantidade
        });
        Alert.alert("Sucesso", "Produto atualizado com sucesso!");
        setEditandoId(null);
      } else {
        await addDoc(collection(db, "registros_gerais"), { 
          produto: produto,
          validade: validade,
          quantidade: quantidade,
          createdAt: serverTimestamp(),
        });
        Alert.alert("Sucesso", "Produto cadastrado com sucesso!");
      }
      
      setProduto(""); 
      setValidade("");
      setQuantidade("");
      await carregarRegistros(); 
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar o produto.");
      console.log("Falha ao salvar: ", error);
    }
  }

  async function excluirRegistro(id: string) {
    try {
      await deleteDoc(doc(db, "registros_gerais", id));
      await carregarRegistros();
    } catch (error) {
      Alert.alert("Erro", "Falha ao excluir o produto.");
      console.log("Falha ao excluir: ", error);
    }
  }

  function prepararEdicao(item: Registro) {
    setProduto(item.produto);
    setValidade(item.validade);
    setQuantidade(item.quantidade);
    setEditandoId(item.id);
  }

  async function carregarRegistros() {
    try {
      setLoading(true);
      const response = query(collection(db, "registros_gerais"), orderBy("createdAt", "desc"), limit(10));
      const snap = await getDocs(response);
      
      setRegistros(snap.docs.map(n => ({ 
        id: n.id, 
        produto: String(n.data().produto ?? ""),
        validade: String(n.data().validade ?? ""),
        quantidade: String(n.data().quantidade ?? "")
      })));
    } catch (error) {
      console.log("Falha ao carregar registros: ", error);
    } finally {
      setLoading(false);
    }
  }

  return (
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
          
          <Text style={styles.title}>Estoque</Text>
          <Text style={styles.subtitle}>
            {editandoId ? "Altere os dados do produto" : "Cadastre um novo produto"}
          </Text>
          
          <View style={styles.form}>
            <Input 
              placeholder="Produto (ex: Arroz)" 
              value={produto}
              onChangeText={setProduto}
            />
            <Input 
              placeholder="Validade (ex: 10/12/2026)" 
              value={validade}
              onChangeText={setValidade}
            />
            <Input 
              placeholder="Quantidade (ex: 50)" 
              value={quantidade}
              onChangeText={setQuantidade}
              keyboardType="numeric" 
            />
            
            <Button 
              label={editandoId ? "Atualizar Produto" : "Cadastrar Produto"} 
              onPress={salvarRegistro}
            />

            {editandoId && (
              <Button 
                label="Cancelar Edição" 
                onPress={() => {
                  setEditandoId(null);
                  setProduto(""); setValidade(""); setQuantidade("");
                }}
              />
            )}
          </View>

          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Produtos Cadastrados:</Text>
            
            {loading ? (
              <ActivityIndicator size="large" color="#0929b8" style={{ marginTop: 20 }} />
            ) : (
              registros.map(item => (
                <View key={item.id} style={styles.listItem}>
                  <Text style={styles.itemTitle}>{item.produto}</Text>
                  <Text style={styles.itemText}>Validade: {item.validade}</Text>
                  <Text style={styles.itemText}>Quantidade: {item.quantidade}</Text>
                  
                  <View style={styles.actionButtons}>
                    <Pressable onPress={() => prepararEdicao(item)}>
                      <Text style={styles.editButton}>Editar</Text>
                    </Pressable>
                    <Pressable onPress={() => excluirRegistro(item.id)}>
                      <Text style={styles.deleteButton}>Excluir</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
            
            {registros.length === 0 && !loading && (
              <Text style={styles.emptyText}>Nenhum produto na lista.</Text>
            )}
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
    padding: 32
  },
  ilustration: {
    width: "100%",
    height: 200, 
    resizeMode: "contain",
    marginTop: 20 
  }, 
  title: { 
    fontSize: 32,
    fontWeight: "900",
    marginTop: 10
  },
  subtitle: {
    fontSize: 16,
    color: "#585860",
    marginBottom: 10
  },    
  form: {
    marginTop: 10,
    gap: 12
  },
  listContainer: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: "#E5E5E5"
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333"
  },
  listItem: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111"
  },
  itemText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#F0F0F0"
  },
  editButton: {
    color: "#0929b8",
    fontWeight: "bold"
  },
  deleteButton: {
    color: "#D32F2F",
    fontWeight: "bold"
  },
  emptyText: {
    textAlign: "center",
    color: "#A0A0A0",
    fontStyle: "italic",
    marginTop: 20
  }
})
