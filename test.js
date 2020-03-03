axios({
    method: 'post',
    url: 'http://127.0.0.1:3001/joinRoom',
    headers: {},
    data: { teamName, roomId }
})
    .then(function (response) {
        setJoinLoading(false);
        goToRoom(roomId, teamName);
    })
    .catch(function (error) {
        console.log(error);
    });
