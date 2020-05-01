import React, { useState, useEffect, ChangeEvent } from "react"
import {
    createStyles,
    makeStyles,
    Theme,
    createMuiTheme,
    ThemeProvider,
} from "@material-ui/core/styles"
import ToastError from "../components/Toast"
import Button from "@material-ui/core/Button"
import CssBaseline from "@material-ui/core/CssBaseline"
import TextField from "@material-ui/core/TextField"
import Link from "@material-ui/core/Link"
import Grid from "@material-ui/core/Grid"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"
import Container from "@material-ui/core/Container"
import Copyright from "../components/Copyright"
import Header from "../components/Header"
import { signUp } from "../network/UserService"
import { useHistory } from "react-router-dom"
import { getJWT } from "../cache/CookieManager"
import { AxiosError } from "axios"

const theme = createMuiTheme({
    palette: {
        primary: {
            main: "#BF953F",
        },
    },
})

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            marginTop: theme.spacing(8),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        },
        form: {
            width: "100%",
            marginTop: theme.spacing(3),
        },
        submit: {
            margin: theme.spacing(3, 0, 2),
            background: "linear-gradient(90deg,#e8d3af,#cda777)!important",
        },
    })
)

export default function Register() {
    const classes = useStyles()
    const history = useHistory()
    const [openToast, setOpenToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [username, SetUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handCloseToast = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === "clickaway") {
            return
        }
        setOpenToast(false)
    }
    const handleUsername = (event: ChangeEvent<HTMLInputElement>) => {
        SetUsername(event.target.value)
    }

    const handleEmail = (event: ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value)
    }

    const handlePassword = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value)
    }

    useEffect(() => {
        if (!!getJWT()) history.push("/dashboard")
    })

    const SignUp = (username: string, email: string, password: string) => {
        signUp(username, email, password)
            .then(() => {
                history.push("/login")
            })
            .catch((err: AxiosError) => {
                const { property } = JSON.parse(err.response?.data?.message)

                setToastMessage(`Ya existe  un usuario registrado con este ${property}`)
                setOpenToast(true)
            })
    }

    return (
        <React.Fragment>
            <Header title="Kinesya"></Header>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <div className={classes.paper}>
                    <Typography component="h1" variant="h5">
                        Registro
                    </Typography>
                    <ThemeProvider theme={theme}>
                        <form className={classes.form}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="username"
                                        label="Usuario"
                                        name="username"
                                        autoComplete="username"
                                        onChange={handleUsername}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Correo electrónico"
                                        name="email"
                                        autoComplete="email"
                                        onChange={handleEmail}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        name="password"
                                        label="Contraseña"
                                        type="password"
                                        id="password"
                                        onChange={handlePassword}
                                    />
                                </Grid>
                            </Grid>
                            <Button
                                fullWidth
                                variant="contained"
                                className={classes.submit}
                                onClick={() => SignUp(username, email, password)}
                            >
                                Registrarse
                            </Button>
                            <Grid container justify="flex-end">
                                <Grid item>
                                    <Link href="/login" variant="body2">
                                        ¿Ya tienes una cuenta? Inicia sesión.
                                    </Link>
                                </Grid>
                            </Grid>
                        </form>
                    </ThemeProvider>
                </div>
                <Box mt={5}>
                    <Copyright />
                </Box>
            </Container>
            <ToastError
                key="alert"
                open={openToast}
                handleClose={handCloseToast}
                message={toastMessage}
            ></ToastError>
        </React.Fragment>
    )
}
