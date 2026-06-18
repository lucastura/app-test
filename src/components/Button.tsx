import {
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps
} from "react-native";

type ButtonProps = TouchableOpacityProps & {
    label: string;
}    

export function Button({ label, style, disabled, ...rest} : ButtonProps){
    return(
        <TouchableOpacity 
            style={[
                styles.container, 
                disabled && styles.containerDisabled,
                style
            ]} 
            activeOpacity={0.7}
            disabled={disabled}
            {...rest}>
            <Text style={[
                    styles.label, 
                    disabled && styles.labelDisabled
                ]}>{label}</Text>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    container:{
        width:"100%",
        height:48,
        backgroundColor: "#3366FF",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
    },
    label: {
        color: "#fff",
        fontSize:16,
        fontWeight:600
    },
    containerDisabled: {
        backgroundColor: "#AAB8FF", //mais apagado
    },
    labelDisabled:{
        color: "#F2F2F2"
    }

})