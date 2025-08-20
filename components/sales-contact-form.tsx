"use client"

import type React from "react"

import { useState } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  Button,
  Box,
  IconButton,
  Tooltip
} from "@mui/material"
import { Info as InfoIcon } from "@mui/icons-material"
import { countries, productOptions } from "@/lib/countries"
import { Loader2 } from "lucide-react"
import { CalendarBooking } from "./calendar-booking"

export function SalesContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [prospectId, setProspectId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    country: "",
    productInterest: "",
    message: "",
  })

  const [showBooking, setShowBooking] = useState(false)

  const handleShowCalendar = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/prospects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          country: formData.country,
          product_interest: formData.productInterest,
          message: formData.message,
        }),
      })

      if (response.ok) {
        const { prospectId } = await response.json()
        setProspectId(prospectId)
        setShowBooking(true)
        fetch(`/api/events`, {
          method: "POST",
          body: JSON.stringify({
            user_id: prospectId,
            event_type: "track",
            event_name: "sales_contact_form_submitted"
          })
        })
      } else {
        throw new Error("Failed to submit form")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      // TODO: Add proper error handling/toast
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
    {(showBooking && prospectId) ? (
      <CalendarBooking prospectId={prospectId} />
    ) : (
    <Card 
      sx={{ 
        backgroundColor: "black", 
        color: "white",
        maxWidth: 600,
        mx: "auto",
        p: 3
      }}
    >
      <CardContent sx={{ pt: 0 }}>
        <Box component="form" onSubmit={handleShowCalendar} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          
          {/* Company Email */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <Typography variant="body1" sx={{ color: "white", mb:2 }}>
            Company Email
          </Typography>
          <FormControl fullWidth>
            <TextField
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email address"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(255, 255, 255, 0.5)",
                  opacity: 1,
                },
              }}
            />
          </FormControl>
          </Box>


          {/* Country */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <Typography variant="body1" sx={{ color: "white", mb:2 }}>
            Country
          </Typography>
          <FormControl fullWidth>
            <InputLabel sx={{ color: "#a1a1a1", "&.Mui-focused": {
              color: "white"
            } }} id="select-country">Select your country</InputLabel>
            <Select
              required
              labelId="select-country"
              label="Select your country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              sx={{
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "white",
                },
                "& .MuiSelect-icon": {
                  color: "white",
                },
              }}
            >
              {countries.map((country) => (
                <MenuItem key={country.value} value={country.value}>
                  {country.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>            
          </Box>


          {/* Primary Product Interest */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <Typography variant="body1" sx={{ color: "white", mb:2 }}>Primary Product Interest</Typography>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "#a1a1a1", "&.Mui-focused": {
              color: "white"
            } }} id="select-product-interest">Select a value</InputLabel>
              <Select
                required
                labelId="select-product-interest"
                label="Select a value"
                value={formData.productInterest}
                onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white",
                  },
                  "& .MuiSelect-icon": {
                    color: "white",
                  },
                }}
              >
                {productOptions.map((product) => (
                  <MenuItem key={product.value} value={product.value}>
                    {product.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>            
          </Box>


          {/* How can we help? */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <Typography variant="body1" sx={{ color: "white", mb:2 }}>How can we help?</Typography>
            <FormControl fullWidth>
              <TextField
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Your company needs..."
                multiline
                rows={4}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "white",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "rgba(255, 255, 255, 0.5)",
                    opacity: 1,
                  },
                }}
              />
            </FormControl>            
          </Box>


          {/* Submit Button */}
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            disabled={isSubmitting}
            sx={{
              mt: 2,
              py: 1.5,
              backgroundColor: "#0070f3",
              color: "white",
              "&:hover": {
                backgroundColor: "#0051cc",
              },
              "&:disabled": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.5)",
              },
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Talk to Vercel"
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>      
    )}
    </>
  )
}
