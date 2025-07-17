package backend.service.utils;

public class PhoneNumberEditor {
    static public boolean isGoodNumber(String phoneNo){
        if(phoneNo.length()<9){
            return false;
        }

        if(phoneNo.startsWith("+254")){
            return true;
        }else if(phoneNo.startsWith("1") || phoneNo.startsWith("7")){
            return true;
        }else return phoneNo.startsWith("07") || phoneNo.startsWith("01");
    }

    static public String resolveNumber(String phoneNo){
        if(phoneNo.startsWith("+254")){
            return phoneNo;
        }else if(phoneNo.startsWith("1") || phoneNo.startsWith("7")){
            return "+254"+phoneNo;
        }else if(phoneNo.startsWith("07") || phoneNo.startsWith("01")){
            phoneNo = phoneNo.substring(1);
            return "+254"+phoneNo;
        }
        return null;
    }
}