//error catch

const errorCatch = (res, err, serverMessage, statusNum, clientMessage) => {
    console.log(serverMessage, err)
    res.status(statusNum).send({message: clientMessage})
}