module.exports ={
  users : [],
  addUserOrUpdate :function(socket){
      var user = this.formatParams(socket.handshake.headers.cookie);
      user.id = socket.handshake.query.id;
      user.picture = socket.handshake.query.picture;
      var savedUser = this.findUser(user.username);
      if (typeof savedUser === "undefined" || savedUser===null){
          user.ids = [socket.id];
          this.users.push(user);
      }else{
          var key = this.users.indexOf(savedUser);
          savedUser.ids.push(socket.id);
          this.users[key] = savedUser;
      }
  },
  checkIfUser: function(socket){
      if (typeof socket.handshake.headers.cookie === "undefined") {
          socket.disconnect();
        return false;
      }
      var user = this.formatParams(socket.handshake.headers.cookie);
      if ((typeof user.token === "undefined" || user.token === null)){
          socket.disconnect();
          return false;
      }
      return true;
}
  ,
  findUserBySocket: function(socket){
      var user =  this.formatParams(socket.handshake.headers.cookie);
      return this.findUser(user.username);
  },

  findUser: function(username){
      return this.users.find((a)=>{ return a.username === username});
  },
  spliceUser : function(socket){
      var user = this.formatParams(socket.handshake.headers.cookie);
      var savedUser = this.findUser(user.username);
      var key = this.users.indexOf(savedUser);
      if (typeof savedUser !== "undefined" || savedUser !== null){
          if (savedUser.ids.length===1){
              this.users.splice(key,1);
          }else{
             var idKey = savedUser.ids.indexOf(socket.id);
             savedUser.ids.splice(idKey,1);
             this.users[key] = savedUser;
          }
      }
  },
  formatParams : function(data){
        var splited = data.split(";");
        var result = {};
        splited.forEach((e) => {
            var temp = e.split("=");
            result[temp[0].replace(" ","")] = temp[1].replace(" ","");
        });

        return result;
    }
};