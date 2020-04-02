const errorCatch = (err, serverMessage, res, statusNum, clientMessage) => {
    console.log(serverMessage, err)
    res.status(statusNum).send({message: clientMessage})
}