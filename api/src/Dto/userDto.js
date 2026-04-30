class UserDTO {
  constructor(username, email, user_id, user_type, burden_rate, active) {
    this.username = username;
    this.email = email;
    this.user_id = user_id;
    this.user_type = user_type;
    this.active = active;
    this.burden_rate = burden_rate;
  }

  static fromModel(userModel) {
    return new UserDTO(
      userModel.username,
      userModel.email,
      userModel.user_id,
      userModel.user_type,
      userModel.burden_rate,
      userModel.active
    );
  }
}

module.exports = UserDTO;
