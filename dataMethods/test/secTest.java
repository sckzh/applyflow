import daoImpls.userDetailedMessageDaoImpl;
import org.junit.Test;

public class secTest {
    @Test
    public void createUserDetailedMessageTable() {
        userDetailedMessageDaoImpl  userDetailedMessageDaoImpl = new userDetailedMessageDaoImpl();
        userDetailedMessageDaoImpl.createUserDetailedMessageTable();
    }

}
