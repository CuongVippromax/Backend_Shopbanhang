package com.cuong.shopbanhang.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressItem implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private String label;
    private String recipientName;
    private String phone;
    private String address;
    private Boolean isDefault;
}
