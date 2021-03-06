import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
export const useStyles = makeStyles((theme: Theme) =>
createStyles({
    root: {
        position:"relative",
        "&:hover":{
            opacity:0.85
        },
        
    },
    input:{
        top:0,
        left:0,
        width: "100%",
        height: "100%",
        opacity: "0",
        overflow: "hidden",
        position: "absolute",
        cursor:"pointer"
       
    },
    img:{
        width:"100%",
        height:"100%",
        border:"none",
        borderRadius:"8px",
        objectFit:"cover",
        
        
    }

})
)