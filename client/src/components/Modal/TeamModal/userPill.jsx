const UserPill = ({ image, text, onClick }) => {
    return (
      <span className="user-pill" onClick={onClick}>
        <img src={image} alt={text} />
        <span>{text}</span>
      </span>
    );
  };
  
  export default UserPill;
   