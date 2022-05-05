import { User } from "@prisma/client";
import styled from "styled-components";

export default styled(({ user, ...props }: { user: User }) => {
  return <img src={user.picture || "/img/placeholder-avatar.png"} {...props} />;
})`
  display: block;
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 4.8rem;
`;
